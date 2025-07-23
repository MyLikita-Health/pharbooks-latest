"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Plus, Eye, Edit, Trash2, Check, X, Loader2, RefreshCw } from "lucide-react"
import { useApiData, useApiMutation } from "@/hooks/use-api-data"
import { usersApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  isApproved: boolean
  isActive: boolean
  phone?: string
  specialization?: string
  licenseNumber?: string
  createdAt: string
  lastLoginAt?: string
}

interface UserStats {
  total: number
  doctors: number
  patients: number
  pharmacists: number
  pending: number
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  // Fetch users with filters
  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useApiData<{ users: User[]; total: number }>(() => {
    const params: any = { limit: 50 }
    if (searchTerm) params.search = searchTerm
    if (filterRole !== "all") params.role = filterRole
    if (filterStatus === "approved") params.status = "approved"
    if (filterStatus === "pending") params.status = "pending"
    return usersApi.getUsers(params)
  }, [searchTerm, filterRole, filterStatus])

  // Fetch user statistics
  const { data: stats, refetch: refetchStats } = useApiData<UserStats>(
    () =>
      usersApi.getUsers({ summary: true }).then((data: any) => ({
        total: data.total || 0,
        doctors: data.doctors || 0,
        patients: data.patients || 0,
        pharmacists: data.pharmacists || 0,
        pending: data.pending || 0,
      })),
    [],
  )

  // User approval mutation
  const { mutate: approveUser, loading: approvingUser } = useApiMutation(
    ({ userId, isApproved }: { userId: string; isApproved: boolean }) => usersApi.approveUser(userId, { isApproved }),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User status updated successfully.",
        })
        refetchUsers()
        refetchStats()
      },
    },
  )

  // User deletion mutation
  const { mutate: deleteUser, loading: deletingUser } = useApiMutation(
    (userId: string) => usersApi.deleteUser(userId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User deleted successfully.",
        })
        refetchUsers()
        refetchStats()
      },
    },
  )

  const handleApproveUser = (userId: string, isApproved: boolean) => {
    approveUser({ userId, isApproved })
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(userId)
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (!user.isApproved) {
      return <Badge variant="destructive">Pending Approval</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      doctor: "bg-blue-100 text-blue-800",
      patient: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{role}</Badge>
  }

  const users = usersData?.users || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">User Management</h1>
            <p className="text-gray-600">Manage all platform users</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refetchUsers} variant="outline" disabled={usersLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doctors</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.doctors || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patients</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.patients || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pharmacists</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.pharmacists || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{stats?.pending || 0}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or license number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="pharmacist">Pharmacists</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterRole !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No users have been registered yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user)}
                        </div>
                        <p className="text-gray-600">{user.email}</p>
                        {user.phone && <p className="text-sm text-gray-500">Phone: {user.phone}</p>}
                        {user.specialization && (
                          <p className="text-sm text-gray-500">Specialization: {user.specialization}</p>
                        )}
                        {user.licenseNumber && <p className="text-sm text-gray-500">License: {user.licenseNumber}</p>}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          {user.lastLoginAt && (
                            <span>Last Login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!user.isApproved && user.role !== "patient" && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveUser(user.id, true)}
                            disabled={approvingUser}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 bg-transparent"
                            onClick={() => handleApproveUser(user.id, false)}
                            disabled={approvingUser}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 bg-transparent"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingUser}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
