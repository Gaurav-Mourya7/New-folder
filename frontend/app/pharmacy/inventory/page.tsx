"use client"

import { useEffect, useMemo, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { addMedicineInventory, getAllMedicineInventory, getMedicineById } from "@/lib/api/services"
import { AddInventoryModal, InventoryFormData } from "./add-inventory-modal"

const statusOptions = ["All", "Good", "Low Stock", "Expiring Soon", "Critical"]

type InventoryUI = {
  id: number
  batchNo: string
  medicineId: number
  medicine: string
  expiry: string
  quantity: number
  status: "Good" | "Low Stock" | "Expiring Soon" | "Critical"
}

export default function InventoryList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [successMessage, setSuccessMessage] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryUI[]>([])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medicineId.toString().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "All" || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [inventory, searchQuery, statusFilter])

  const handleAddBatch = async (inventoryData: InventoryFormData) => {
    try {
      await addMedicineInventory({
        medicineId: inventoryData.medicineId,
        batchNo: inventoryData.batchNo,
        expiryDate: inventoryData.expiry,
        quantity: inventoryData.quantity,
      } as any)

      await reloadInventory()
      setSuccessMessage("Inventory batch added successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch {
      setSuccessMessage("Failed to add inventory batch.")
      setTimeout(() => setSuccessMessage(""), 3000)
      throw new Error("Failed to add inventory")
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getAllMedicineInventory()
        if (cancelled) return

        const mapped: InventoryUI[] = await Promise.all(
          (data ?? []).map(async (item) => {
            const medicineId = Number(item.medicineId ?? 0)
            const med = medicineId ? await getMedicineById(medicineId) : null

            const expiryTs = item.expiryDate ? new Date(item.expiryDate).getTime() : null
            const daysLeft =
              expiryTs != null ? Math.ceil((expiryTs - Date.now()) / 86400000) : null

            const quantity = Number(item.quantity ?? 0)
            const stockStatus = (item.status ?? "").toString()

            let status: InventoryUI["status"] = "Good"
            if (stockStatus === "EXPIRED") status = "Critical"
            else if (quantity <= 20) status = "Low Stock"
            else if (daysLeft != null && daysLeft <= 30) status = "Expiring Soon"

            return {
              id: Number(item.id ?? 0),
              batchNo: item.batchNo ?? "",
              medicineId,
              medicine: med?.name ?? "",
              expiry: item.expiryDate ?? "",
              quantity,
              status,
            }
          }),
        )

        setInventory(mapped)
      } catch {
        if (!cancelled) setInventory([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function reloadInventory() {
    setIsLoading(true)
    try {
      const data = await getAllMedicineInventory()
      const mapped: InventoryUI[] = await Promise.all(
        (data ?? []).map(async (item) => {
          const medicineId = Number(item.medicineId ?? 0)
          const med = medicineId ? await getMedicineById(medicineId) : null

          const expiryTs = item.expiryDate ? new Date(item.expiryDate).getTime() : null
          const daysLeft =
            expiryTs != null ? Math.ceil((expiryTs - Date.now()) / 86400000) : null

          const quantity = Number(item.quantity ?? 0)
          const stockStatus = (item.status ?? "").toString()

          let status: InventoryUI["status"] = "Good"
          if (stockStatus === "EXPIRED") status = "Critical"
          else if (quantity <= 20) status = "Low Stock"
          else if (daysLeft != null && daysLeft <= 30) status = "Expiring Soon"

          return {
            id: Number(item.id ?? 0),
            batchNo: item.batchNo ?? "",
            medicineId,
            medicine: med?.name ?? "",
            expiry: item.expiryDate ?? "",
            quantity,
            status,
          }
        }),
      )

      setInventory(mapped)
    } catch {
      setInventory([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Good":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
            <CheckCircle className="size-3" />
            {status}
          </Badge>
        )
      case "Low Stock":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
            <AlertTriangle className="size-3" />
            {status}
          </Badge>
        )
      case "Expiring Soon":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 gap-1">
            <Clock className="size-3" />
            {status}
          </Badge>
        )
      case "Critical":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <AlertTriangle className="size-3" />
            {status}
          </Badge>
        )
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

  // Calculate summary stats from loaded inventory state
  const totalItems = inventory.length
  const goodItems = inventory.filter((i) => i.status === "Good").length
  const lowStockItems = inventory.filter((i) => i.status === "Low Stock").length
  const criticalItems = inventory.filter((i) => i.status === "Critical" || i.status === "Expiring Soon").length

  return (
    <AppLayout roleLabel="Admin" title="Inventory">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Track batches and stock levels
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Batch
          </Button>
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
                  <Package className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Batches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle className="size-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{goodItems}</p>
                  <p className="text-sm text-muted-foreground">Good Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="size-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalItems}</p>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by batch or medicine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Inventory Batches ({filteredInventory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading inventory...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Batch/Lot
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Medicine ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Medicine
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Expiry Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4 font-mono text-sm">{item.batchNo}</td>
                        <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">
                          #{item.medicineId}
                        </td>
                        <td className="py-3 px-4 font-medium">{item.medicine}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(item.expiry)}
                        </td>
                        <td className="py-3 px-4">{item.quantity} units</td>
                        <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredInventory.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No inventory items found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add Inventory Modal */}
        <AddInventoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddInventory={handleAddBatch}
        />
      </div>
    </AppLayout>
  )
}
