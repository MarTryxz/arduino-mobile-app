import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
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
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#007bff" />
          <link rel="icon" href="/openrakiduamlogo.webp" type="image/webp" />
        </head>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
