import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const { discoverEntities, getAccessToken } = await import('@/lib/d365')
    // First verify we can authenticate
    await getAccessToken()

    // Then discover entities
    const entities = await discoverEntities()

    return NextResponse.json({
      connected: true,
      entities,
      totalEntities: (entities as any[]).length,
    })
  } catch (error: any) {
    console.error('Discovery error:', error)
    return NextResponse.json(
      {
        connected: false,
        error: error.message || 'Failed to connect to D365',
        entities: [],
      },
      { status: 500 }
    )
  }
}
