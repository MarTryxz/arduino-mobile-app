import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AquaGuard',
  description: 'Arduino based aquaponics monitoring system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007bff" />
      </head>
      <body>{children}</body>
    </html>
  )
}
