import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { VideoCallProvider } from "@/components/video-call-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediLinka - Healthcare Management System",
  description: "Comprehensive healthcare management platform connecting patients, doctors, and pharmacists",
}

// Mock current user - in production, this would come from authentication
const mockCurrentUser = {
  id: "user-123",
  name: "Dr. Sarah Johnson",
  role: "doctor" as const,
  isOnline: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <VideoCallProvider currentUser={mockCurrentUser}>
              {children}
              <Toaster />
            </VideoCallProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
