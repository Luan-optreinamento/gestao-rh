import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestão Financeira — OP Treinamentos',
  description: 'Sistema de gestão financeira e RH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}