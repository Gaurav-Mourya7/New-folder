"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddMedicineModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMedicine: (medicine: MedicineFormData) => Promise<void>
}

export interface MedicineFormData {
  name: string
  dosage: string
  category: string
  type: string
  manufacturer: string
  unitPrice: number
}

interface FormErrors {
  name?: string
  dosage?: string
  manufacturer?: string
  unitPrice?: string
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

export function AddMedicineModal({ isOpen, onClose, onAddMedicine }: AddMedicineModalProps) {
  const [formData, setFormData] = useState<MedicineFormData>({
    name: "",
    dosage: "",
    category: "OTHER",
    type: "TABLET",
    manufacturer: "",
    unitPrice: 0,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Medicine name is required"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Medicine name must be at least 3 characters"
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required"
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required"
    }

    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = "Unit price must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onAddMedicine(formData)
      setFormData({
        name: "",
        dosage: "",
        category: "OTHER", 
        type: "TABLET",
        manufacturer: "",
        unitPrice: 0,
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error("Failed to add medicine:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add medicine"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  setErrors(prev => ({ ...prev, name: undefined }))
                }}
                placeholder="e.g., Amoxicillin"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dosage: e.target.value }))
                  setErrors(prev => ({ ...prev, dosage: undefined }))
                }}
                placeholder="e.g., 500mg"
                className={errors.dosage ? "border-destructive" : ""}
              />
              {errors.dosage && <p className="text-sm text-destructive">{errors.dosage}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MED_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MED_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, manufacturer: e.target.value }))
                  setErrors(prev => ({ ...prev, manufacturer: undefined }))
                }}
                placeholder="e.g., Pfizer"
                className={errors.manufacturer ? "border-destructive" : ""}
              />
              {errors.manufacturer && <p className="text-sm text-destructive">{errors.manufacturer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))
                  setErrors(prev => ({ ...prev, unitPrice: undefined }))
                }}
                placeholder="e.g., 10.50"
                className={errors.unitPrice ? "border-destructive" : ""}
              />
              {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
