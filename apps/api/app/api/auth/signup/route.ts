import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function POST(request: NextRequest) {
  try {
    const { email, polarCustomerId, tier = 'free' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Create user (or return existing)
    const { rows: existingUser } = await sql`
      SELECT id, tier FROM users WHERE email = $1
    `, [email]

    if (existingUser.length > 0) {
      // User exists, return token
      const token = await new SignJWT({
        userId: existingUser[0].id,
        email,
        tier: existingUser[0].tier,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(JWT_SECRET)

      return NextResponse.json({ token, userId: existingUser[0].id })
    }

    // Create new user
    const { rows: newUser } = await sql`
      INSERT INTO users (email, polar_customer_id, tier, active)
      VALUES ($1, $2, $3, true)
      RETURNING id
    `, [email, polarCustomerId, tier]

    const userId = newUser[0].id
    const token = await new SignJWT({
      userId,
      email,
      tier,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET)

    return NextResponse.json({ token, userId }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
