'use client'

import { useState } from 'react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError('Invalid email')
        setLoading(false)
        return
      }

      // Generate simple JWT-like token locally
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`
      const token = btoa(JSON.stringify({
        userId,
        email,
        createdAt: new Date().toISOString(),
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000
      }))

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('userId', userId)
      localStorage.setItem('email', email)

      // Redirect to dashboard
      await new Promise(r => setTimeout(r, 500))
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Sign up failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'system-ui', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>🎯</h1>
        <h2 style={{ margin: '0 0 5px 0' }}>GARZA OS</h2>
        <p style={{ color: '#666', margin: '0' }}>Multi-Tenant OpenClaw SaaS</p>
      </div>

      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up Free'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#fee',
          color: '#c33',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      <p style={{ color: '#999', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
        Start free. Deploy unlimited agents on Vercel.
      </p>
    </div>
  )
}
