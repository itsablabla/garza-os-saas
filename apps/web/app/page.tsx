'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/signup'
    }
  }, [])

  return <div>Redirecting...</div>
}
