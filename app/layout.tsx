import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import BackgroundMusic from './components/BackgroundMusic'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CM Dashboard | Candidate Manager Tracker',
  description: 'Real-time Candidate Manager Performance Dashboard with D365 Integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {/* Animated Background */}
        <div className="bg-mesh" />
        <div className="bg-stars" />
        <div className="bg-aurora" />

        <main className="relative z-10">
          {children}
        </main>
        <BackgroundMusic />
      </body>
    </html>
  )
}
