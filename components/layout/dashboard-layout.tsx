"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Home,
  Calendar,
  FileText,
  Pill,
  Users,
  BarChart3,
  Video,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", href: `/${user?.role}`, icon: Home },
      { name: "Profile", href: `/${user?.role}/profile`, icon: User },
    ]

    switch (user?.role) {
      case "patient":
        return [
          ...baseItems,
          { name: "Appointments", href: "/patient/appointments", icon: Calendar },
          { name: "Consultations", href: "/patient/consultations", icon: Video },
          { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
          { name: "Medical Records", href: "/patient/records", icon: FileText },
          { name: "Messages", href: "/patient/messages", icon: MessageSquare },
        ]
      case "doctor":
        return [
          ...baseItems,
          { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
          { name: "Consultations", href: "/doctor/consultations", icon: Video },
          { name: "Patients", href: "/doctor/patients", icon: Users },
          { name: "Prescriptions", href: "/doctor/prescriptions", icon: Pill },
          { name: "Messages", href: "/doctor/messages", icon: MessageSquare },
        ]
      case "pharmacist":
        return [
          ...baseItems,
          { name: "Prescriptions", href: "/pharmacist/prescriptions", icon: Pill },
          { name: "Orders", href: "/pharmacist/orders", icon: FileText },
          { name: "Inventory", href: "/pharmacist/inventory", icon: BarChart3 },
          { name: "Messages", href: "/pharmacist/messages", icon: MessageSquare },
        ]
      case "admin":
        return [
          ...baseItems,
          { name: "Users", href: "/admin/users", icon: Users },
          { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
          { name: "Appointments", href: "/admin/appointments", icon: Calendar },
          { name: "Prescriptions", href: "/admin/prescriptions", icon: Pill },
          { name: "Settings", href: "/admin/settings", icon: Settings },
        ]
      case "hub":
        return [
          ...baseItems,
          { name: "Patients", href: "/hub/patients", icon: Users },
          { name: "Appointments", href: "/hub/appointments", icon: Calendar },
          { name: "Doctor Matching", href: "/hub/matching", icon: Activity },
          { name: "Analytics", href: "/hub/analytics", icon: BarChart3 },
          { name: "Messages", href: "/hub/messages", icon: MessageSquare },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`
          fixed z-40 inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:relative lg:inset-0
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">MediLinka</span>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 capitalize">{user?.role} Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${user?.role}/profile`}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  )
}
