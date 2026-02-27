import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { auth } from '@/lib/auth'

// GET /api/goclaw/[userId]/agents
// List all agents for a user (multi-tenant isolation)
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify user is authenticated and owns this userId
    const session = await auth(request)
    if (!session || session.userId !== params.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query only this user's agents
    const { rows } = await sql`
      SELECT id, name, model, status, created_at
      FROM agents
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [params.userId]

    return NextResponse.json({ agents: rows })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

// POST /api/goclaw/[userId]/agents
// Create a new agent for a user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth(request)
    if (!session || session.userId !== params.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, model = 'claude-haiku-4-5', description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    // Create agent with user_id isolation
    const { rows } = await sql`
      INSERT INTO agents (user_id, name, model, description, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id, name, model, status, created_at
    `, [params.userId, name, model, description]

    return NextResponse.json({ agent: rows[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
