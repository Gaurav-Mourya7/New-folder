"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Eye,
  Download,
  Pencil,
  Trash2,
} from "lucide-react"
import { getAllSales, getSaleItemsBySaleId, updateSale, deleteSale } from "@/lib/api/services"
import { NewSaleModal } from "./new-sale-modal"

type SaleUI = {
  id: string
  customer: string
  date: string
  items: number
  total: number
  status: string
  paymentMethod: string
}

export default function SalesList() {
  const router = useRouter()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [appliedStartDate, setAppliedStartDate] = useState("")
  const [appliedEndDate, setAppliedEndDate] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [saleRows, setSaleRows] = useState<SaleUI[]>([])
  const [cancelled, setCancelled] = useState(false)

  const filteredSales = useMemo(() => {
    const start = appliedStartDate ? new Date(appliedStartDate).getTime() : null
    // Make `endDate` inclusive by using end-of-day timestamp.
    const end = appliedEndDate
      ? new Date(appliedEndDate).getTime() + 86399999
      : null

    return saleRows.filter((s) => {
      if (!s.date) return false
      const t = new Date(s.date).getTime()
      if (start != null && Number.isFinite(start) && t < start) return false
      if (end != null && Number.isFinite(end) && t > end) return false
      return true
    })
  }, [saleRows, appliedStartDate, appliedEndDate])

  const load = async () => {
    try {
      const sales = await getAllSales()
      const mapped: SaleUI[] = await Promise.all(
        (sales ?? []).map(async (sale) => {
          const items = await getSaleItemsBySaleId(Number(sale.id))
          return {
            id: String(sale.id),
            customer: "Walk-in Customer", // Default customer name
            date: sale.saleDate ? String(sale.saleDate) : "",
            items: items.length,
            total: Number(sale.totalAmount ?? 0),
            status: "Completed",
            paymentMethod: "CASH",
          }
        }),
      )
      if (!cancelled) setSaleRows(mapped)
    } catch {
      if (!cancelled) setSaleRows([])
    } finally {
      if (!cancelled) setIsLoading(false)
    }
  }

  useEffect(() => {
    setCancelled(false)
    load()

    return () => {
      setCancelled(true)
    }
  }, [])

  const handleApplyFilter = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
    setSuccessMessage(
      `Filtering sales from ${startDate || "start"} to ${endDate || "end"}`,
    )
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleExport = () => {
    try {
      const header = [
        "invoice",
        "date",
        "items",
        "total",
        "paymentMethod",
        "status",
      ]
      const rows = filteredSales.map((s) =>
        [
          s.id,
          s.date,
          String(s.items),
          String(s.total),
          s.paymentMethod,
          s.status,
        ].join(","),
      )

      const csv = [header.join(","), ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sales_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccessMessage("Sales exported successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch {
      setSuccessMessage("Sales export failed.")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const handleNewSale = () => {
    setIsNewSaleModalOpen(true)
  }

  const handleSaleCreated = async () => {
    await load() // Reload sales data
    setSuccessMessage("Sale created successfully.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/pharmacy/sales/${id}`)
  }

  const handleEdit = (id: string) => {
    // For now, navigate to details page
    // In future, open edit modal
    router.push(`/pharmacy/sales/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale? This action cannot be undone.")) return

    try {
      await deleteSale(Number(id))
      setSuccessMessage("Sale deleted successfully.")
      await load() // Reload sales data
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to delete sale:", error)
      alert("Failed to delete sale")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{status}</Badge>
      case "Pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status}</Badge>
      case "Refunded":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate summary stats
  const totalSales = saleRows
    .filter((s) => s.status === "Completed")
    .reduce((sum, s) => sum + s.total, 0)
  const totalOrders = saleRows.filter((s) => s.status === "Completed").length
  const averageOrder = totalSales / totalOrders || 0
  const pendingOrders = saleRows.filter((s) => s.status === "Pending").length

  return (
    <AppLayout roleLabel="Admin" title="Sales">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales</h1>
            <p className="text-muted-foreground mt-1">
              View and manage sales transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewSale} className="gap-2">
              <ShoppingCart className="size-4" />
              New Sale
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <ShoppingCart className="size-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${averageOrder.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Average Order</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Calendar className="size-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-sm font-medium mb-2 block">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="text-sm font-medium mb-2 block">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleApplyFilter} className="gap-2">
                <Calendar className="size-4" />
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              Sales Transactions ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading sales...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Invoice</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Items</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{sale.id}</td>
                          <td className="py-3 px-4 font-medium">{sale.customer}</td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(sale.date)}</td>
                          <td className="py-3 px-4">{sale.items} item{sale.items > 1 ? "s" : ""}</td>
                          <td className="py-3 px-4 font-medium">${sale.total.toFixed(2)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{sale.paymentMethod}</td>
                          <td className="py-3 px-4">{getStatusBadge(sale.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(sale.id)}
                                className="size-8"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(sale.id)}
                                className="size-8"
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(sale.id)}
                                className="size-8 text-red-600"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredSales.map((sale) => (
                    <Card key={sale.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{sale.customer}</p>
                          <p className="text-sm text-blue-600 font-mono">Invoice #{sale.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale.id)} className="size-8">
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(sale.id)} className="size-8">
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="size-8 text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formatDate(sale.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Items:</span>
                          <span className="font-medium">{sale.items} item{sale.items > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">${sale.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment:</span>
                          <span className="font-medium">{sale.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {getStatusBadge(sale.status)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredSales.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No sales found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* New Sale Modal */}
        <NewSaleModal
          isOpen={isNewSaleModalOpen}
          onClose={() => setIsNewSaleModalOpen(false)}
          onSaleCreated={handleSaleCreated}
        />
      </div>
    </AppLayout>
  )
}
