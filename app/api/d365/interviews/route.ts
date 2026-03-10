import { NextResponse } from 'next/server'
import { getManagerForCandidate, MANAGERS } from '@/lib/managers'
import { Interview, ManagerStats } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const INTERVIEW_LEVEL_MAP: Record<number, 'Initial' | 'Final' | null> = {
  3: null,      // Screening - excluded
  1: 'Initial',
  2: 'Final',
  4: 'Final',   // Post Offer counts as Final
  6: null,      // Prep Call - excluded
}

function isMarchInterview(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d.getMonth() === 2 && d.getFullYear() === 2026 // March = month index 2
}

export async function GET() {
  try {
    let interviews: Interview[] = []

    const { queryD365 } = await import('@/lib/d365')
    // Query itsutra_interviews entity with all needed fields including client lookup
    const result = await queryD365('itsutra_interviews', {
      '$select': 'itsutra_interviewid,itsutra_name,itsutra_interviewlevel,itsutra_starttime,itsutra_calendarviewinformationtitle,itsutra_location,itsutra_islegit,statuscode,statecode,itsutra_interviewmode,_itsutra_client_value',
      '$orderby': 'itsutra_starttime desc',
      '$top': '2000',
    })

    // Collect client IDs from March interviews for account type lookup
    const marchClientIds = new Set<string>()

    if (result.value && result.value.length > 0) {
      for (const record of result.value) {
        const calTitle = record.itsutra_calendarviewinformationtitle || ''
        const titleParts = calTitle.split('|').map((s: string) => s.trim())
        const candidateNameRaw = titleParts[0] || ''
        const companyFromTitle = titleParts[1] || ''

        const clientName =
          record['_itsutra_client_value@OData.Community.Display.V1.FormattedValue'] ||
          companyFromTitle || ''
        const candidateCampaignName =
          record['_itsutra_candidatecampaign_value@OData.Community.Display.V1.FormattedValue'] ||
          candidateNameRaw || ''
        const candidateName =
          record['_itsutra_candidate_value@OData.Community.Display.V1.FormattedValue'] ||
          candidateCampaignName || candidateNameRaw || ''

        const levelCode = record.itsutra_interviewlevel
        const levelFormatted = record['itsutra_interviewlevel@OData.Community.Display.V1.FormattedValue'] || ''
        let stage: 'Initial' | 'Final' | null = null

        if (levelCode !== null && levelCode !== undefined && levelCode in INTERVIEW_LEVEL_MAP) {
          stage = INTERVIEW_LEVEL_MAP[levelCode]
        } else if (levelFormatted) {
          const lower = levelFormatted.toLowerCase()
          if (lower.includes('final') || lower.includes('post offer')) stage = 'Final'
          else if (lower.includes('initial')) stage = 'Initial'
        }

        if (!stage) continue

        const status = record['statuscode@OData.Community.Display.V1.FormattedValue'] || 'Active'
        const dateStr = record.itsutra_starttime || record.createdon || ''

        // Only include March 2026 interviews
        if (!isMarchInterview(dateStr)) continue

        const match = getManagerForCandidate(candidateName) || getManagerForCandidate(candidateNameRaw)
        if (!match) continue

        const clientId = record._itsutra_client_value || null

        // Track March interview client IDs
        if (clientId) {
          marchClientIds.add(clientId)
        }

        interviews.push({
          id: record.itsutra_interviewid || Math.random().toString(),
          candidateName: match.matchedCandidate,
          companyName: clientName,
          stage,
          date: dateStr,
          status,
          managerId: match.manager.id,
          managerName: match.manager.name,
          accountType: undefined,
          isEndClient: undefined,
          _clientId: clientId, // temporary for mapping
        } as any)
      }
    }

    // Fetch account types for March interview clients (parallel batches)
    const accountTypeMap = new Map<string, { type: string; isEndClient: boolean }>()

    if (marchClientIds.size > 0) {
      const clientIdArray = Array.from(marchClientIds)

      // Fire all batch requests in parallel instead of sequentially
      const batchPromises: Promise<void>[] = []
      for (let i = 0; i < clientIdArray.length; i += 50) {
        const batch = clientIdArray.slice(i, i + 50)
        const filter = batch.map(id => `accountid eq ${id}`).join(' or ')

        batchPromises.push(
          queryD365('accounts', {
            '$select': 'accountid,itsutra_accounttype',
            '$filter': filter,
          }).then(accountResult => {
            if (accountResult.value) {
              for (const acc of accountResult.value) {
                const typeName = acc['itsutra_accounttype@OData.Community.Display.V1.FormattedValue'] || ''
                accountTypeMap.set(acc.accountid, {
                  type: typeName,
                  isEndClient: typeName === 'End Client',
                })
              }
            }
          }).catch(e => {
            console.error('Error fetching account types batch:', e)
          })
        )
      }
      await Promise.all(batchPromises)
    }

    // Enrich interviews with account type and remove temp _clientId in single pass
    interviews = interviews.map(interview => {
      const clientId = (interview as any)._clientId
      const { _clientId, ...clean } = interview as any

      if (clientId && accountTypeMap.has(clientId)) {
        const acctInfo = accountTypeMap.get(clientId)!
        return { ...clean, accountType: acctInfo.type, isEndClient: acctInfo.isEndClient }
      }

      return { ...clean, accountType: 'Unknown', isEndClient: false }
    })

    // Calculate manager stats
    const managerStats: ManagerStats[] = MANAGERS.map(m => {
      const managerInterviews = interviews.filter(i => i.managerId === m.id)
      const initial = managerInterviews.filter(i => i.stage === 'Initial').length
      const final = managerInterviews.filter(i => i.stage === 'Final').length
      const total = managerInterviews.length

      return {
        managerId: m.id,
        managerName: m.name,
        color: m.color,
        totalInterviews: total,
        screening: 0,
        initial,
        final,
        conversionRate: total > 0 ? Math.round((final / total) * 100) : 0,
        candidates: m.candidates.map(c => c.name),
      }
    })

    return NextResponse.json({
      interviews,
      managerStats,
      interviewEntity: 'itsutra_interviews',
      totalCount: interviews.length,
    })
  } catch (error: any) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch interviews',
        interviews: [],
        managerStats: MANAGERS.map(m => ({
          managerId: m.id,
          managerName: m.name,
          color: m.color,
          totalInterviews: 0,
          screening: 0,
          initial: 0,
          final: 0,
          conversionRate: 0,

          candidates: m.candidates.map(c => c.name),
        })),
      },
      { status: 500 }
    )
  }
}
