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
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E3A8A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}