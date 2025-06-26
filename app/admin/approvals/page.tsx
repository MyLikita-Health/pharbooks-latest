"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Clock, CheckCircle, XCircle, Eye } from "lucide-react"

export default function AdminApprovals() {
  const pendingApprovals = [
    {
      id: 1,
      name: "Dr. Emily Johnson",
      email: "emily.johnson@email.com",
      role: "doctor",
      specialization: "Dermatology",
      licenseNumber: "MD67890",
      submittedAt: "2024-01-15",
      documents: ["Medical License", "Board Certification", "CV"],
    },
    {
      id: 2,
      name: "PharmD. Robert Chen",
      email: "robert.chen@email.com",
      role: "pharmacist",
      licenseNumber: "PH12345",
      submittedAt: "2024-01-14",
      documents: ["Pharmacy License", "DEA Registration", "CV"],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">User Approvals</h1>
            <p className="text-gray-600">Review and approve healthcare professional registrations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-orange-600">12</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600">5</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">2</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {pendingApprovals.map((approval) => (
            <Card key={approval.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{approval.name}</h3>
                      <p className="text-gray-600">{approval.email}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {approval.role} {approval.specialization && `• ${approval.specialization}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        License: {approval.licenseNumber} • Submitted: {approval.submittedAt}
                      </p>
                      <p className="text-sm text-gray-500">Documents: {approval.documents.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">Pending Review</Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
