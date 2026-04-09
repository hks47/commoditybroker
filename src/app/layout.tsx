import type { Metadata } from 'next'
import { Special_Elite, Courier_Prime } from 'next/font/google'
import './globals.css'

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-typewriter',
})

export const metadata: Metadata = {
  title: 'CommodityBroker Inc. | Scranton Branch',
  description: 'AI-powered commodity brokering platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${specialElite.variable} ${courierPrime.variable}`}>
        {children}
      </body>
    </html>
  )
}
