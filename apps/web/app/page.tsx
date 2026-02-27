'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')

    if (!token || !userId) {
      // Redirect to signup
      window.location.href = '/signup'
      return
    }

    // Fetch agents
    fetch(`/api/goclaw/${userId}/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🎯 GARZA OS Dashboard</h1>
      <p>Multi-tenant OpenClaw SaaS on Vercel</p>

      <h2>Your Agents</h2>
      {loading ? (
        <p>Loading...</p>
      ) : agents.length === 0 ? (
        <p>No agents yet. Create one to get started!</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id}>
              <strong>{agent.name}</strong> ({agent.model})
              <br />
              Status: {agent.status} • Created: {agent.created_at}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          const name = prompt('Agent name:')
          if (name) {
            const userId = localStorage.getItem('userId')
            const token = localStorage.getItem('token')
            fetch(`/api/goclaw/${userId}/agents`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name }),
            })
              .then((r) => r.json())
              .then(() => window.location.reload())
          }
        }}
      >
        + Create Agent
      </button>
    </div>
  )
}
