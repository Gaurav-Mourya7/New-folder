"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  Calendar,
  ShoppingCart,
  Package,
  User,
} from "lucide-react"
import { getSaleById, getSaleItemsBySaleId } from "@/lib/api/services"
import type { SaleDto } from "@/lib/api/types"
import type { SaleItemDto } from "@/lib/api/types"

export default function SaleDetails() {
  const params = useParams()
  const router = useRouter()
  const saleId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [sale, setSale] = useState<SaleDto | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItemDto[]>([])

  useEffect(() => {
    loadSaleDetails()
  }, [saleId])

  const loadSaleDetails = async () => {
    try {
      const [saleData, itemsData] = await Promise.all([
        getSaleById(Number(saleId)),
        getSaleItemsBySaleId(Number(saleId)),
      ])
      setSale(saleData)
      setSaleItems(itemsData ?? [])
    } catch (error) {
      console.error("Failed to load sale details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <AppLayout roleLabel="Admin" title="Sale Details">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground">Loading sale details...</div>
        </div>
      </AppLayout>
    )
  }

  if (!sale) {
    return (
      <AppLayout roleLabel="Admin" title="Sale Details">
        <div className="flex flex-col gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 w-fit">
            <ArrowLeft className="size-4" />
            Back to Sales
          </Button>
          <div className="text-center text-muted-foreground">Sale not found</div>
        </div>
      </AppLayout>
    )
  }

  const totalAmount = saleItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)

  return (
    <AppLayout roleLabel="Admin" title="Sale Details">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sale Details</h1>
            <p className="text-muted-foreground mt-1">
              Sale #{sale.id}
            </p>
          </div>
        </div>

        {/* Sale Information */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-semibold">{formatDate(sale.saleDate || "")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <ShoppingCart className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items</p>
                  <p className="text-2xl font-bold">{saleItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Receipt className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <p className="text-lg font-semibold">{sale.paymentMethod || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sale Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              Sale Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{sale.customerName || "Walk-in Customer"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{sale.customerPhone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sale Date</p>
                <p className="font-medium">{formatDateTime(sale.saleDate || "")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge variant="outline">{sale.paymentMethod || "N/A"}</Badge>
              </div>
            </div>
            {sale.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{sale.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Sale Items ({saleItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saleItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No items in this sale
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Medicine</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Batch No</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{item.medicineName || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.batchNo || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.quantity || 0}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatCurrency(item.unitPrice || 0)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalAmount || 0)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2">
                      <td colSpan={4} className="py-3 px-4 text-right font-bold">
                        Grand Total
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-lg">
                        {formatCurrency(totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Sales
          </Button>
          <Button className="gap-2" onClick={() => window.print()}>
            <Receipt className="size-4" />
            Print Receipt
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
