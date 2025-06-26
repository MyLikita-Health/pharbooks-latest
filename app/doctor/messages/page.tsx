"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send, User } from "lucide-react"

export default function DoctorMessages() {
  const conversations = [
    {
      id: 1,
      name: "Jane Patient",
      lastMessage: "Thank you for the prescription. When should I schedule my next visit?",
      time: "1 hour ago",
      unread: 2,
    },
    {
      id: 2,
      name: "John Smith",
      lastMessage: "I'm feeling much better after taking the medication.",
      time: "3 hours ago",
      unread: 0,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Messages</h1>
            <p className="text-gray-600">Communicate with your patients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Patient Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search patients..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{conversation.name}</h4>
                      {conversation.unread > 0 && <Badge className="bg-red-500">{conversation.unread}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conversation.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Jane Patient</CardTitle>
              <CardDescription>Patient conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg p-4 mb-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Thank you for the prescription. When should I schedule my next visit?</p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Type your response..." className="flex-1" />
                <Button>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
