import type React from "react"
import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function PageWrapper({ children, className, maxWidth = "full" }: PageWrapperProps) {
  const maxWidthClasses = {
    sm: "max-w-sm mx-auto",
    md: "max-w-md mx-auto",
    lg: "max-w-lg mx-auto",
    xl: "max-w-xl mx-auto",
    "2xl": "max-w-2xl mx-auto",
    full: "w-full",
  }

  return <div className={cn(maxWidthClasses[maxWidth], className)}>{children}</div>
}
