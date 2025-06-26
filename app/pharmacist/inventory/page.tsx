"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Search, Plus, AlertTriangle, Package } from "lucide-react"

export default function PharmacistInventory() {
  const inventory = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      status: "good",
      lastRestocked: "2024-01-10",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      currentStock: 25,
      minStock: 100,
      maxStock: 400,
      status: "low",
      lastRestocked: "2024-01-05",
    },
    {
      id: 3,
      medication: "Atorvastatin 20mg",
      currentStock: 8,
      minStock: 30,
      maxStock: 200,
      status: "critical",
      lastRestocked: "2024-01-01",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Inventory</h1>
            <p className="text-gray-600">Manage medication stock levels</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">183</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-3xl font-bold text-orange-600">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                  <p className="text-3xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search medications..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {inventory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.status === "critical"
                          ? "bg-red-100"
                          : item.status === "low"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                      }`}
                    >
                      <BarChart3
                        className={`w-6 h-6 ${
                          item.status === "critical"
                            ? "text-red-600"
                            : item.status === "low"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.medication}</h3>
                      <p className="text-gray-600">Current Stock: {item.currentStock}</p>
                      <p className="text-sm text-gray-500">
                        Min: {item.minStock} • Max: {item.maxStock}
                      </p>
                      <p className="text-sm text-gray-500">Last restocked: {item.lastRestocked}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        item.status === "critical" ? "destructive" : item.status === "low" ? "default" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
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
