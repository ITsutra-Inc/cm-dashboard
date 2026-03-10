import { NextResponse } from 'next/server'
import { discoverEntities, getAccessToken } from '@/lib/d365'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
