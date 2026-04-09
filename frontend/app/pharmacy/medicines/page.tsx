"use client"

import { useEffect, useMemo, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
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
import { Search, Plus, Pill, Edit, Trash2 } from "lucide-react"
import { addMedicine, deleteMedicine, getAllMedicines, updateMedicine } from "@/lib/api/services"
import { AddMedicineModal, MedicineFormData } from "./add-medicine-modal"
import { EditMedicineModal, MedicineFormData as EditMedicineFormData, MedicineUI as EditMedicineUI } from "./edit-medicine-modal"
import { DeleteMedicineModal } from "./delete-medicine-modal"

type MedicineUI = {
  id: number
  name: string
  category: string // MedicineCategory enum key
  type: string // MedicineType enum key
  dosage: string
  manufacturer: string
  price: number
  stock: number
  status: "In Stock" | "Low Stock" | "Critical"
}

export default function MedicineList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [successMessage, setSuccessMessage] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<MedicineUI | null>(null)
  const [deletingMedicine, setDeletingMedicine] = useState<MedicineUI | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [medicines, setMedicines] = useState<MedicineUI[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch = 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.id.toString().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "All" || med.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [medicines, searchQuery, categoryFilter])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getAllMedicines()
        if (cancelled) return

        const mapped: MedicineUI[] = (data ?? []).map((m) => {
          const stock = Number(m.stock ?? 0)
          const status: MedicineUI["status"] =
            stock <= 10 ? "Critical" : stock <= 50 ? "Low Stock" : "In Stock"

          return {
            id: Number(m.id ?? 0),
            name: m.name ?? "",
            category: (m.category ?? "").toString(),
            type: (m.type ?? "").toString(),
            dosage: m.dosage ?? "",
            manufacturer: m.manufacturer ?? "",
            price: Number(m.unitPrice ?? 0),
            stock,
            status,
          }
        })

        const cats = ["All", ...Array.from(new Set(mapped.map((m) => m.category).filter(Boolean)))]
        setMedicines(mapped)
        setCategories(cats)
        setCategoryFilter("All")
      } catch {
        if (!cancelled) setMedicines([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function reloadMedicines() {
    const data = await getAllMedicines()
    const mapped: MedicineUI[] = (data ?? []).map((m) => {
      const stock = Number(m.stock ?? 0)
      const status: MedicineUI["status"] =
        stock <= 10 ? "Critical" : stock <= 50 ? "Low Stock" : "In Stock"

      return {
        id: Number(m.id ?? 0),
        name: m.name ?? "",
        category: (m.category ?? "").toString(),
        type: (m.type ?? "").toString(),
        dosage: m.dosage ?? "",
        manufacturer: m.manufacturer ?? "",
        price: Number(m.unitPrice ?? 0),
        stock,
        status,
      }
    })

    const cats = ["All", ...Array.from(new Set(mapped.map((m) => m.category).filter(Boolean)))]
    setMedicines(mapped)
    setCategories(cats)
    setCategoryFilter("All")
  }

  function normalizeEnumKey(value: string, allowed: string[], fallback: string) {
    const upper = value.trim().toUpperCase()
    return allowed.includes(upper) ? upper : fallback
  }

  const MED_CATEGORIES = [
    "ANTIBIOTIC",
    "ANALGESIC",
    "ANTIHISTAMINE",
    "ANTISEPTIC",
    "VITAMIN",
    "MINERAL",
    "HERBAL",
    "HOMEOPATHIC",
    "OTHER",
  ]

  const MED_TYPES = [
    "SYRUP",
    "TABLET",
    "CAPSULE",
    "INJECTION",
    "OINTMENT",
    "LIQUID",
    "POWDER",
    "CREAM",
    "SPRAY",
    "DROPS",
  ]

  const handleAddMedicine = async (medicineData: MedicineFormData) => {
    try {
      setSuccessMessage("")
      await addMedicine({
        ...medicineData,
        unitPrice: medicineData.unitPrice,
      } as any)

      await reloadMedicines()
      setSuccessMessage("Medicine added successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (e) {
      setSuccessMessage("Failed to add medicine.")
      setTimeout(() => setSuccessMessage(""), 3000)
      throw e
    }
  }

  const handleEdit = (medicine: MedicineUI) => {
    setEditingMedicine(medicine)
    setIsEditModalOpen(true)
  }

  const handleEditMedicine = async (medicineData: EditMedicineFormData) => {
    try {
      await updateMedicine({
        ...medicineData,
        unitPrice: medicineData.unitPrice,
      } as any)

      await reloadMedicines()
      setSuccessMessage("Medicine updated successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch {
      setSuccessMessage("Failed to update medicine.")
      setTimeout(() => setSuccessMessage(""), 3000)
      throw new Error("Failed to update medicine")
    }
  }

  const handleDelete = (medicine: MedicineUI) => {
    setDeletingMedicine(medicine)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteMedicine = async () => {
    if (!deletingMedicine) return
    
    try {
      await deleteMedicine(deletingMedicine.id)
      await reloadMedicines()
      setSuccessMessage("Medicine deleted successfully.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch {
      setSuccessMessage("Failed to delete medicine.")
      setTimeout(() => setSuccessMessage(""), 3000)
      throw new Error("Failed to delete medicine")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{status}</Badge>
      case "Low Stock":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status}</Badge>
      case "Critical":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AppLayout roleLabel="Admin" title="Medicines">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medicines</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medicine catalog
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Medicine
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Medicines Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="size-5 text-primary" />
              Medicine Catalog ({filteredMedicines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading medicines...
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.map((medicine) => (
                        <tr key={medicine.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">
                            #{medicine.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Pill className="size-4 text-primary" />
                              </div>
                              <span className="font-medium">{medicine.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{medicine.category}</td>
                          <td className="py-3 px-4 font-medium">${medicine.price.toFixed(2)}</td>
                          <td className="py-3 px-4">{medicine.stock} units</td>
                          <td className="py-3 px-4">{getStatusBadge(medicine.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(medicine)}
                                className="size-8"
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(medicine)}
                                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  {filteredMedicines.map((medicine) => (
                    <Card key={medicine.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Pill className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{medicine.name}</p>
                            <p className="text-sm text-blue-600 font-mono">#{medicine.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(medicine)} className="size-8">
                            <Edit className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(medicine)} className="size-8 text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{medicine.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">${medicine.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock:</span>
                          <span className="font-medium">{medicine.stock} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {getStatusBadge(medicine.status)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredMedicines.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No medicines found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Add Medicine Modal */}
        <AddMedicineModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddMedicine={handleAddMedicine}
        />
        
        {/* Edit Medicine Modal */}
        <EditMedicineModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEditMedicine={handleEditMedicine}
          medicine={editingMedicine}
        />
        
        {/* Delete Medicine Modal */}
        <DeleteMedicineModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleteMedicine={handleDeleteMedicine}
          medicineName={deletingMedicine?.name || ""}
          medicineId={deletingMedicine?.id || 0}
        />
      </div>
    </AppLayout>
  )
}
