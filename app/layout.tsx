import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EMC SquidGame Eliminations',
  description: 'Created with love by EMC Team',
  generator: 'EMC',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
