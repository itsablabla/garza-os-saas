import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-polar-signature')

    // Verify webhook signature
    const secret = process.env.POLAR_WEBHOOK_SECRET || ''
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle order.created event
    if (event.type === 'order.created') {
      const { customer_email, product_id, tier } = event.data

      // Update user's tier + billing
      await sql`
        UPDATE users SET tier = $1, active = true
        WHERE email = $2
      `, [tier, customer_email]

      await sql`
        INSERT INTO billing (user_id, polar_order_id, tier, status)
        SELECT id, $1, $2, 'active'
        FROM users
        WHERE email = $3
        ON CONFLICT (user_id) DO UPDATE
        SET tier = $2, status = 'active'
      `, [event.id, tier, customer_email]
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
