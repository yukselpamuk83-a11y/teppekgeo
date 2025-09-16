
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/session-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harita İş İlanları - Dünya Çapında İş Fırsatları',
  description: 'Harita üzerinde iş ilanları, CV/tanıtım mesajları ve gold ilanları keşfedin. Tüm dünyadan iş fırsatları tek platformda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
