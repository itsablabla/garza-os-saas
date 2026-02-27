'use client'

import { useState } from 'react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try local first, then fallback to standalone API
      let response
      try {
        response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      } catch (e) {
        // Fallback to standalone API
        response = await fetch('https://garza-os-api-standalone.vercel.app/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      }

      const data = await response.json()

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('email', email)
        window.location.href = '/'
      }
    } catch (error) {
      alert('Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'system-ui' }}>
      <h1>🎯 GARZA OS</h1>
      <p>Multi-Tenant OpenClaw SaaS</p>

      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px' }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
        Start free. Deploy unlimited agents on Vercel.
      </p>
    </div>
  )
}
