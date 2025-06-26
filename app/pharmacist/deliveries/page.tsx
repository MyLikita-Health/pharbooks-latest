"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Truck, Search, MapPin, Clock, CheckCircle } from "lucide-react"

export default function PharmacistDeliveries() {
  const deliveries = [
    {
      id: 1,
      patient: "Jane Patient",
      address: "123 Main St, City, State 12345",
      medications: ["Lisinopril 10mg", "Aspirin 81mg"],
      status: "in_transit",
      estimatedDelivery: "2024-01-16 2:00 PM",
      driver: "John Delivery",
    },
    {
      id: 2,
      patient: "John Smith",
      address: "456 Oak Ave, City, State 12345",
      medications: ["Metformin 500mg"],
      status: "delivered",
      deliveredAt: "2024-01-15 3:30 PM",
      driver: "Sarah Transport",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Deliveries</h1>
            <p className="text-gray-600">Track medication deliveries</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search deliveries..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {delivery.status === "delivered" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Truck className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Delivery #{delivery.id}</h3>
                      <p className="text-gray-600">Patient: {delivery.patient}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {delivery.address}
                      </div>
                      <p className="text-sm text-gray-500">{delivery.medications.join(", ")}</p>
                      <p className="text-sm text-gray-500">Driver: {delivery.driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <Badge variant={delivery.status === "delivered" ? "default" : "secondary"}>
                        {delivery.status.replace("_", " ")}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {delivery.status === "delivered"
                          ? `Delivered: ${delivery.deliveredAt}`
                          : `ETA: ${delivery.estimatedDelivery}`}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track
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
