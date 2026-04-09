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

interface AddInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAddInventory: (inventoryData: InventoryFormData) => Promise<void>
}

export interface InventoryFormData {
  batchNo: string
  medicineId: number
  expiry: string
  quantity: number
}

interface FormErrors {
  batchNo?: string
  medicineId?: string
  expiry?: string
  quantity?: string
}

export function AddInventoryModal({ isOpen, onClose, onAddInventory }: AddInventoryModalProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    batchNo: "",
    medicineId: 0,
    expiry: "",
    quantity: 0,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.batchNo.trim()) {
      newErrors.batchNo = "Batch number is required"
    } else if (formData.batchNo.trim().length < 3) {
      newErrors.batchNo = "Batch number must be at least 3 characters"
    }

    if (formData.medicineId <= 0) {
      newErrors.medicineId = "Please enter a valid medicine ID"
    }

    if (!formData.expiry) {
      newErrors.expiry = "Expiry date is required"
    } else {
      const expiryDate = new Date(formData.expiry)
      const today = new Date()
      if (expiryDate <= today) {
        newErrors.expiry = "Expiry date must be in the future"
      }
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0"
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
      await onAddInventory(formData)
      setFormData({
        batchNo: "",
        medicineId: 0,
        expiry: "",
        quantity: 0,
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error("Failed to add inventory:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add inventory"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Batch</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch/Lot No. *</Label>
              <Input
                id="batchNo"
                value={formData.batchNo}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, batchNo: e.target.value }))
                  setErrors(prev => ({ ...prev, batchNo: undefined }))
                }}
                placeholder="e.g., BATCH001"
                className={errors.batchNo ? "border-destructive" : ""}
              />
              {errors.batchNo && <p className="text-sm text-destructive">{errors.batchNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicineId">Medicine ID *</Label>
              <Input
                id="medicineId"
                type="number"
                min="1"
                value={formData.medicineId || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, medicineId: Number(e.target.value) || 0 }))
                  setErrors(prev => ({ ...prev, medicineId: undefined }))
                }}
                placeholder="Medicine ID from Medicines page"
                className={errors.medicineId ? "border-destructive" : ""}
              />
              {errors.medicineId && <p className="text-sm text-destructive">{errors.medicineId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, expiry: e.target.value }))
                  setErrors(prev => ({ ...prev, expiry: undefined }))
                }}
                className={errors.expiry ? "border-destructive" : ""}
              />
              {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, quantity: Number(e.target.value) || 0 }))
                  setErrors(prev => ({ ...prev, quantity: undefined }))
                }}
                placeholder="Number of units"
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> You can find the Medicine ID from the Medicines page.
            Each medicine has a unique ID number.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
