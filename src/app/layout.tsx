import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ClientLayout from '../components/providers/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bourbon Buddy',
  description: 'Your personal bourbon collection manager and streaming platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon.ico' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-900 text-white`}>
        <ClientLayout>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" richColors theme="dark" />
        </ClientLayout>
      </body>
    </html>
  )
} 