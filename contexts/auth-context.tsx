"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Update the UserRole type to include "hub"
export type UserRole = "patient" | "doctor" | "pharmacist" | "admin" | "hub"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isApproved: boolean
  specialization?: string
  licenseNumber?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: RegisterData) => Promise<boolean>
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  specialization?: string
  licenseNumber?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Cookie utility functions
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token in cookies and verify it
    const token = getCookie("medilinka_token")
    if (token) {
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        deleteCookie("medilinka_token")
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      deleteCookie("medilinka_token")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)

        // Store token in cookie (7 days expiry)
        setCookie("medilinka_token", data.token, 7)

        setIsLoading(false)

        // Redirect to appropriate dashboard
        setTimeout(() => {
          window.location.href = `/${data.user.role}`
        }, 100)

        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user.isApproved) {
          setUser(data.user)
          // Store token in cookie (7 days expiry)
          setCookie("medilinka_token", data.token, 7)
        }
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    deleteCookie("medilinka_token")
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
