import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export interface Session {
  userId: string
  email: string
  tier: string
}

export async function auth(request: NextRequest): Promise<Session | null> {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    if (!token) return null

    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as Session
  } catch (error) {
    return null
  }
}
