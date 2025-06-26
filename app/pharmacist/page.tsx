"use client"

import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Clock, Package, Truck, AlertTriangle, CheckCircle, ArrowRight, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function PharmacistDashboard() {
  const { user } = useAuth()

  const pendingPrescriptions = [
    {
      id: 1,
      patient: "Jane Patient",
      doctor: "Dr. Sarah Smith",
      medication: "Lisinopril 10mg",
      quantity: "30 tablets",
      status: "pending_verification",
      priority: "high",
      submittedAt: "2 hours ago",
    },
    {
      id: 2,
      patient: "John Smith",
      doctor: "Dr. Michael Johnson",
      medication: "Metformin 500mg",
      quantity: "60 tablets",
      status: "verified",
      priority: "medium",
      submittedAt: "4 hours ago",
    },
    {
      id: 3,
      patient: "Mary Johnson",
      doctor: "Dr. Sarah Smith",
      medication: "Atorvastatin 20mg",
      quantity: "30 tablets",
      status: "ready_for_pickup",
      priority: "low",
      submittedAt: "1 day ago",
    },
  ]

  const recentOrders = [
    {
      id: 1,
      patient: "Robert Wilson",
      medications: ["Aspirin 81mg", "Vitamin D3"],
      total: "$24.99",
      status: "delivered",
      deliveryDate: "2024-01-10",
    },
    {
      id: 2,
      patient: "Lisa Brown",
      medications: ["Omeprazole 20mg"],
      total: "$15.50",
      status: "in_transit",
      deliveryDate: "2024-01-12",
    },
    {
      id: 3,
      patient: "David Lee",
      medications: ["Metoprolol 50mg", "Hydrochlorothiazide 25mg"],
      total: "$32.75",
      status: "processing",
      deliveryDate: "2024-01-13",
    },
  ]

  const inventoryAlerts = [
    {
      medication: "Lisinopril 10mg",
      currentStock: 15,
      minStock: 50,
      status: "low",
    },
    {
      medication: "Metformin 500mg",
      currentStock: 8,
      minStock: 30,
      status: "critical",
    },
    {
      medication: "Atorvastatin 20mg",
      currentStock: 25,
      minStock: 40,
      status: "low",
    },
  ]

  const stats = [
    { label: "Pending Prescriptions", value: "23", icon: Pill, color: "blue" },
    { label: "Orders Today", value: "18", icon: Package, color: "green" },
    { label: "In Transit", value: "12", icon: Truck, color: "orange" },
    { label: "Low Stock Items", value: "7", icon: AlertTriangle, color: "red" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-purple-100">
            You have {pendingPrescriptions.length} prescriptions awaiting verification and {inventoryAlerts.length}{" "}
            inventory alerts.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-purple-900">Pending Prescriptions</CardTitle>
                <CardDescription>Prescriptions requiring verification</CardDescription>
              </div>
              <Link href="/pharmacist/prescriptions">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          prescription.priority === "high"
                            ? "bg-red-100"
                            : prescription.priority === "medium"
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                        }`}
                      >
                        <Pill
                          className={`w-5 h-5 ${
                            prescription.priority === "high"
                              ? "text-red-600"
                              : prescription.priority === "medium"
                                ? "text-yellow-600"
                                : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{prescription.medication}</h4>
                        <p className="text-sm text-gray-600">Patient: {prescription.patient}</p>
                        <p className="text-sm text-gray-600">Dr: {prescription.doctor}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{prescription.submittedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          prescription.status === "pending_verification"
                            ? "destructive"
                            : prescription.status === "verified"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {prescription.status.replace("_", " ")}
                      </Badge>
                      {prescription.status === "pending_verification" && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-purple-900">Recent Orders</CardTitle>
                <CardDescription>Latest medication deliveries</CardDescription>
              </div>
              <Link href="/pharmacist/orders">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        {order.status === "delivered" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : order.status === "in_transit" ? (
                          <Truck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Package className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{order.patient}</h4>
                        <p className="text-sm text-gray-600">{order.medications.join(", ")}</p>
                        <p className="text-sm text-gray-500">Delivery: {order.deliveryDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "in_transit"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900 mt-1">{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-purple-900">Inventory Alerts</CardTitle>
              <CardDescription>Medications running low in stock</CardDescription>
            </div>
            <Link href="/pharmacist/inventory">
              <Button variant="outline" size="sm">
                Manage Inventory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inventoryAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    alert.status === "critical" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle
                      className={`w-5 h-5 ${alert.status === "critical" ? "text-red-600" : "text-yellow-600"}`}
                    />
                    <Badge variant={alert.status === "critical" ? "destructive" : "default"}>{alert.status}</Badge>
                  </div>
                  <h4 className="font-medium text-gray-900">{alert.medication}</h4>
                  <p className="text-sm text-gray-600">
                    Current: {alert.currentStock} | Min: {alert.minStock}
                  </p>
                  <Button size="sm" className="mt-2 w-full" variant="outline">
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-900">Quick Actions</CardTitle>
            <CardDescription>Common pharmacy tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/pharmacist/prescriptions/verify">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
                  <FileText className="w-6 h-6" />
                  <span>Verify Prescriptions</span>
                </Button>
              </Link>

              <Link href="/pharmacist/orders/process">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                  <Package className="w-6 h-6" />
                  <span>Process Orders</span>
                </Button>
              </Link>

              <Link href="/pharmacist/inventory">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                  <BarChart3 className="w-6 h-6" />
                  <span>Manage Inventory</span>
                </Button>
              </Link>

              <Link href="/pharmacist/reports">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700">
                  <FileText className="w-6 h-6" />
                  <span>Generate Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
