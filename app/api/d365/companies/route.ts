import { NextResponse } from 'next/server'
import { getAccounts, getIndustryName } from '@/lib/d365'
import { Company } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const accounts = await getAccounts()

    const companies: Company[] = accounts.map((a: any) => ({
      id: a.accountid || '',
      name: a.name || 'Unknown',
      city: a.address1_city || 'N/A',
      industry: a['industrycode@OData.Community.Display.V1.FormattedValue'] || getIndustryName(a.industrycode),
      phone: a.telephone1 || '',
      website: a.websiteurl || '',
      email: a.emailaddress1 || '',
      interviewCount: 0,
    }))

    return NextResponse.json({ companies, totalCount: companies.length })
  } catch (error: any) {
    console.error('Companies API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch companies', companies: [] },
      { status: 500 }
    )
  }
}
