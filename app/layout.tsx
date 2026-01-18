import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReNova - E-Waste Management Platform",
  description: "Connect with buyers and sellers for responsible e-waste recycling",
  generator: "v0.app",
  icons: {
    icon: "/renova-icon.png",
    shortcut: "/renova-icon.png",
    apple: "/renova-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
            <Analytics />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
