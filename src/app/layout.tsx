import type { Metadata } from 'next'
import '../index.css'
import { Analytics } from '@vercel/analytics/react'
import { PortfolioFooter } from '../components/PortfolioFooter'

export const metadata: Metadata = {
  title: 'Reshma Lokanathan — Product Designer',
  description:
    '4+ years designing and simplifying human experiences for complex systems by connecting data, workflows, and decisions.',
  openGraph: {
    title: 'Reshma Lokanathan — Product Designer',
    description: 'Designing for people, in an AI-first world.',
    url: 'https://reshmalokanathan.com',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PortfolioFooter />
        <Analytics />
      </body>
    </html>
  )
}

