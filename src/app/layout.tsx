import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/themeProvider'
import { Toaster } from '@/components/ui/toaster'
import Provider from '@/context/clientProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'STBOT',
  description: 'A twitch bot made for getting spotify songs'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang='en'>
      <body className={cn('min-h-screen bg-background font-sans antialiased ', fontSans.variable)}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          <Provider session={session}>
            <div className='bg-slate-950 h-screen'>
              <Header />
              <div className='h-full pt-14'>{children}</div>
            </div>
            <Toaster />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}
