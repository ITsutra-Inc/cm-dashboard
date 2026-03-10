function getEnv() {
  const TENANT_ID = process.env.D365_TENANT_ID || ''
  const CLIENT_ID = process.env.D365_CLIENT_ID || ''
  const CLIENT_SECRET = process.env.D365_CLIENT_SECRET || ''
  const ORG_URL = (process.env.D365_ORG_URL || '').replace(/\/$/, '')
  const API_BASE = `${ORG_URL}/api/data/v9.2`
  return { TENANT_ID, CLIENT_ID, CLIENT_SECRET, ORG_URL, API_BASE }
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, ORG_URL } = getEnv()
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: `${ORG_URL}/.default`,
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token error (${res.status}): ${err}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.token
}

export async function queryD365(
  entitySet: string,
  params?: Record<string, string>
): Promise<any> {
  const { API_BASE } = getEnv()
  const token = await getAccessToken()

  const url = new URL(`${API_BASE}/${entitySet}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
      Prefer: 'odata.include-annotations="*",odata.maxpagesize=500',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`D365 query error (${res.status}) for ${entitySet}: ${err}`)
  }

  return res.json()
}

export async function discoverEntities(): Promise<any[]> {
  const { API_BASE } = getEnv()
  const token = await getAccessToken()

  // Fetch all entity definitions without filter (D365 has limited filter support on metadata)
  const url = `${API_BASE}/EntityDefinitions?$select=LogicalName,EntitySetName`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Entity discovery error (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.value.map((e: any) => ({
    logicalName: e.LogicalName,
    entitySetName: e.EntitySetName,
  }))
}

export async function findInterviewEntity(): Promise<string | null> {
  const candidateEntities = [
    'mshr_hcmjobinterviewentities',
    'cr_interviews',
    'new_interviews',
    'cra4e_interviews',
    'interviews',
    'cr_interview',
    'new_interview',
    'msdyn_interviews',
  ]

  for (const entity of candidateEntities) {
    try {
      const result = await queryD365(entity, { '$top': '1' })
      if (result && (result.value !== undefined)) {
        return entity
      }
    } catch {
      continue
    }
  }

  // Try discovering from entity definitions
  try {
    const entities = await discoverEntities()
    const interviewEntity = (entities as any[]).find((e: any) =>
      e.logicalName.includes('interview') ||
      e.displayName?.toLowerCase().includes('interview')
    )
    if (interviewEntity) {
      return interviewEntity.entitySetName
    }
  } catch {
    // ignore
  }

  return null
}

export async function getAccounts(): Promise<any[]> {
  try {
    const result = await queryD365('accounts', {
      '$select': 'name,address1_city,industrycode,revenue,telephone1,websiteurl,emailaddress1,numberofemployees,createdon',
      '$top': '500',
      '$orderby': 'name asc',
    })
    return result.value || []
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export async function getContacts(): Promise<any[]> {
  try {
    const result = await queryD365('contacts', {
      '$select': 'fullname,emailaddress1,jobtitle,telephone1,company,createdon',
      '$top': '200',
      '$orderby': 'fullname asc',
    })
    return result.value || []
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
}

export async function getAppointments(): Promise<any[]> {
  try {
    const result = await queryD365('appointments', {
      '$select': 'subject,scheduledstart,scheduledend,description,location,statecode,statuscode',
      '$top': '500',
      '$orderby': 'scheduledstart desc',
    })
    return result.value || []
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
}

// Map D365 industry codes to readable names
export function getIndustryName(code: number | null): string {
  const industries: Record<number, string> = {
    1: 'Accounting', 2: 'Agriculture', 3: 'Broadcasting', 4: 'Brokers',
    5: 'Childcare', 6: 'Clubs', 7: 'Consulting', 8: 'Consumer Services',
    9: 'Design', 10: 'Distributors', 11: 'Doctors', 12: 'Education',
    13: 'Electronics', 14: 'Energy', 15: 'Entertainment', 16: 'Equipment',
    17: 'Finance', 18: 'Food & Tobacco', 19: 'Government', 20: 'Healthcare',
    21: 'Hospitality', 22: 'Insurance', 23: 'Legal', 24: 'Manufacturing',
    25: 'Marketing', 26: 'Media', 27: 'Non-Profit', 28: 'Recreation',
    29: 'Retail', 30: 'Shipping', 31: 'Technology', 32: 'Telecommunications',
    33: 'Utilities',
  }
  return code ? industries[code] || 'Other' : 'N/A'
}
