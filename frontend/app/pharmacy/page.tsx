"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export default function PharmacyDashboard() {
  return (
    <AppLayout roleLabel="Admin" title="Pharmacy Dashboard">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of inventory, sales, and alerts
          </p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Pharmacy overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Use the Medicines, Inventory, and Sales sections in the sidebar to view real-time
              data from your pharmacy backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
