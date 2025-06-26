"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Search, Plus, Paperclip } from "lucide-react"
import { useState } from "react"

export default function PatientMessages() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const conversations = [
    {
      id: 1,
      doctor: "Dr. Sarah Smith",
      specialization: "Cardiology",
      lastMessage:
        "Your test results look good. Let's schedule a follow-up appointment to discuss the next steps in your treatment plan.",
      timestamp: "2 hours ago",
      unread: 2,
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      doctor: "Dr. Michael Johnson",
      specialization: "General Medicine",
      lastMessage: "Please take the medication as prescribed and let me know if you have any side effects.",
      timestamp: "1 day ago",
      unread: 0,
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      doctor: "Dr. Emily Davis",
      specialization: "Dermatology",
      lastMessage: "The cream should help with the condition. Apply twice daily.",
      timestamp: "3 days ago",
      unread: 1,
      avatar: "/placeholder.svg",
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "Dr. Sarah Smith",
      content: "Hello! I've reviewed your recent test results.",
      timestamp: "10:30 AM",
      isDoctor: true,
    },
    {
      id: 2,
      sender: "You",
      content: "Thank you, Doctor. How do they look?",
      timestamp: "10:35 AM",
      isDoctor: false,
    },
    {
      id: 3,
      sender: "Dr. Sarah Smith",
      content:
        "Your test results look good. Let's schedule a follow-up appointment to discuss the next steps in your treatment plan.",
      timestamp: "10:40 AM",
      isDoctor: true,
    },
    {
      id: 4,
      sender: "You",
      content: "That's great news! When would be a good time for the follow-up?",
      timestamp: "10:45 AM",
      isDoctor: false,
    },
  ]

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Conversations List */}
        <div className="w-1/3 flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Messages</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedConversation === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.doctor} />
                        <AvatarFallback>{conversation.doctor.charAt(3)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm truncate">{conversation.doctor}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs px-2 py-1">{conversation.unread}</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{conversation.specialization}</p>
                        <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <Card className="flex-1 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/placeholder.svg" alt="Doctor" />
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Dr. Sarah Smith</h3>
                    <p className="text-sm text-gray-600">Cardiology</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Online
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isDoctor ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isDoctor ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${message.isDoctor ? "text-gray-500" : "text-blue-100"}`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
