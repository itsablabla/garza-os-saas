'use client'

import { useEffect, useState } from 'react'

interface Agent {
  id: string
  name: string
  model: string
  status: string
  created_at: string
}

interface SystemMetrics {
  cpu: number
  ram: number
  disk: number
  uptime: number
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [theme, setTheme] = useState('midnight')
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')

    if (!token || !userId) {
      window.location.href = '/signup'
      return
    }

    // Load agents from localStorage
    const savedAgents = localStorage.getItem(`agents_${userId}`)
    if (savedAgents) {
      try {
        setAgents(JSON.parse(savedAgents))
      } catch (e) {
        setAgents([])
      }
    }
    setLoading(false)

    // Simulate metrics
    setMetrics({
      cpu: Math.random() * 80,
      ram: Math.random() * 60,
      disk: Math.random() * 40,
      uptime: 99.9,
    })
  }, [])

  const saveAgents = (newAgents: Agent[]) => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      localStorage.setItem(`agents_${userId}`, JSON.stringify(newAgents))
    }
    setAgents(newAgents)
  }

  const createAgent = () => {
    const name = prompt('Agent name:')
    if (!name) return

    const newAgent: Agent = {
      id: `agent_${Math.random().toString(36).substr(2, 9)}`,
      name,
      model: 'claude-3-sonnet-20240229',
      status: Math.random() > 0.3 ? 'active' : 'offline',
      created_at: new Date().toISOString(),
    }

    saveAgents([...agents, newAgent])
  }

  const deleteAgent = (id: string) => {
    if (confirm('Delete this agent?')) {
      saveAgents(agents.filter(a => a.id !== id))
    }
  }

  const themes = {
    midnight: {
      bg: '#1a1a2e',
      surface: 'rgba(255,255,255,0.05)',
      accent: '#667eea',
      text: '#e5e5e5',
    },
    nord: {
      bg: '#2e3440',
      surface: 'rgba(255,255,255,0.05)',
      accent: '#88c0d0',
      text: '#eceff4',
    },
    light: {
      bg: '#f5f5f5',
      surface: '#ffffff',
      accent: '#667eea',
      text: '#333333',
    },
  }

  const currentTheme =
    themes[theme as keyof typeof themes] || themes.midnight

  const renderAgentDesk = (agent: Agent, index: number) => {
    const x = (index % 3) * 120 + 20
    const y = Math.floor(index / 3) * 120 + 20
    const isActive = agent.status === 'active'

    return (
      <div
        key={agent.id}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: '100px',
          height: '100px',
          background: currentTheme.surface,
          border: `2px solid ${isActive ? '#4caf50' : '#f44336'}`,
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          opacity: isActive ? 1 : 0.5,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow =
            `0 0 20px ${currentTheme.accent}`
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {agent.name}
        </div>
        <div style={{ fontSize: '10px', color: '#999' }}>
          {agent.model.split('-')[0]}
        </div>
        <div
          style={{
            fontSize: '10px',
            marginTop: '8px',
            color: isActive ? '#4caf50' : '#f44336',
          }}
        >
          {isActive ? '🟢 Active' : '🔴 Offline'}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: currentTheme.bg,
        color: currentTheme.text,
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: `1px solid ${currentTheme.surface}`,
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🎯 GARZA OS</h1>
          <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
            Fleet Control Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              const themes_list = ['midnight', 'nord', 'light']
              const next = themes_list[(themes_list.indexOf(theme) + 1) % themes_list.length]
              setTheme(next)
            }}
            style={{
              padding: '10px 15px',
              background: currentTheme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🎨 Theme
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              window.location.href = '/signup'
            }}
            style={{
              padding: '10px 15px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: `1px solid ${currentTheme.surface}`,
          paddingBottom: '15px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'list', label: '📋 Agents', icon: '📋' },
          { id: '3d', label: '🏢 Office', icon: '🏢' },
          { id: 'metrics', label: '📊 Metrics', icon: '📊' },
          { id: 'crons', label: '⏰ Crons', icon: '⏰' },
          { id: 'memory', label: '🧠 Memory', icon: '🧠' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '10px 15px',
              background:
                view === tab.id ? currentTheme.accent : 'transparent',
              color: view === tab.id ? 'white' : currentTheme.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: view === tab.id ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View: Agent List */}
      {view === 'list' && (
        <div>
          <h2>Your Agents ({agents.length})</h2>
          {agents.length === 0 ? (
            <p style={{ color: '#999' }}>No agents yet. Create one to get started!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    background: currentTheme.surface,
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${currentTheme.accent}`,
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {agent.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Model: {agent.model.split('-')[0]}
                  </div>
                  <div
                    style={{
                      color: agent.status === 'active' ? '#4caf50' : '#f44336',
                      fontSize: '12px',
                      marginTop: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {agent.status === 'active' ? '🟢' : '🔴'} {agent.status}
                  </div>
                  <div style={{ color: '#999', fontSize: '11px', marginTop: '8px' }}>
                    {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    style={{
                      marginTop: '10px',
                      padding: '6px 10px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={createAgent}
            style={{
              marginTop: '20px',
              padding: '12px 20px',
              background: currentTheme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            + Create Agent
          </button>
        </div>
      )}

      {/* View: 3D Office */}
      {view === '3d' && (
        <div>
          <h2>🏢 Agent Office (3D View)</h2>
          <p style={{ color: '#999', marginBottom: '15px' }}>
            Each desk represents one agent. Green = active, Red = offline. Hover over desks for effects.
          </p>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '500px',
              background: currentTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${currentTheme.accent}`,
              overflow: 'auto',
            }}
          >
            {agents.map((agent, idx) => renderAgentDesk(agent, idx))}
            {agents.length === 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#999',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>📭</p>
                <p>No agents yet. Create one in the Agents tab!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View: System Metrics */}
      {view === 'metrics' && metrics && (
        <div>
          <h2>📊 System Metrics</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            {[
              { label: 'CPU Usage', value: metrics.cpu, unit: '%', color: '#ff9800' },
              { label: 'RAM Usage', value: metrics.ram, unit: '%', color: '#2196f3' },
              { label: 'Disk Usage', value: metrics.disk, unit: '%', color: '#f44336' },
              {
                label: 'Uptime',
                value: metrics.uptime,
                unit: '%',
                color: '#4caf50',
              },
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  background: currentTheme.surface,
                  padding: '20px',
                  borderRadius: '8px',
                  border: `2px solid ${metric.color}`,
                }}
              >
                <div style={{ color: '#999', fontSize: '12px' }}>
                  {metric.label}
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: metric.color,
                    marginTop: '10px',
                  }}
                >
                  {metric.value.toFixed(1)}
                  {metric.unit}
                </div>
                <div
                  style={{
                    marginTop: '10px',
                    height: '4px',
                    background: currentTheme.surface,
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${metric.value}%`,
                      background: metric.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: Crons */}
      {view === 'crons' && (
        <div>
          <h2>⏰ Scheduled Jobs</h2>
          <p style={{ color: '#999' }}>Cron jobs for your agents</p>
          <div
            style={{
              background: currentTheme.surface,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.accent}`,
              color: '#999',
            }}
          >
            No scheduled jobs yet. Create agents to add cron jobs.
          </div>
        </div>
      )}

      {/* View: Memory */}
      {view === 'memory' && (
        <div>
          <h2>🧠 Agent Memory</h2>
          <p style={{ color: '#999' }}>Agent memory files and context</p>
          <div
            style={{
              background: currentTheme.surface,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${currentTheme.accent}`,
              color: '#999',
            }}
          >
            No memory files yet. Create agents to generate memory.
          </div>
        </div>
      )}
    </div>
  )
}
