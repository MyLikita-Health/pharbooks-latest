"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Truck, CheckCircle, Clock } from "lucide-react"

export default function PharmacistOrders() {
  const orders = [
    {
      id: 1,
      patient: "Jane Patient",
      medications: ["Lisinopril 10mg", "Aspirin 81mg"],
      total: "$45.99",
      status: "processing",
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-17",
    },
    {
      id: 2,
      patient: "John Smith",
      medications: ["Metformin 500mg"],
      total: "$25.50",
      status: "shipped",
      orderDate: "2024-01-14",
      deliveryDate: "2024-01-16",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Orders</h1>
            <p className="text-gray-600">Manage medication orders and deliveries</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      {order.status === "shipped" ? (
                        <Truck className="w-6 h-6 text-green-600" />
                      ) : order.status === "delivered" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                      <p className="text-gray-600">Patient: {order.patient}</p>
                      <p className="text-sm text-gray-500">{order.medications.join(", ")}</p>
                      <p className="text-sm text-gray-500">
                        Ordered: {order.orderDate} • Delivery: {order.deliveryDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold">{order.total}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
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
