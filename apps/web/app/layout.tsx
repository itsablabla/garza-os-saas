import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GARZA OS - Multi-Tenant SaaS',
  description: 'Deploy unlimited OpenClaw agents on Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
