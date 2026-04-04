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

export function AddInventoryModal({ isOpen, onClose, onAddInventory }: AddInventoryModalProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    batchNo: "",
    medicineId: 0,
    expiry: "",
    quantity: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.batchNo || !formData.expiry || formData.medicineId <= 0 || formData.quantity <= 0) {
      alert("Please fill in all fields with valid values")
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
      onClose()
    } catch (error) {
      console.error("Failed to add inventory:", error)
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch/Lot No. *</Label>
              <Input
                id="batchNo"
                value={formData.batchNo}
                onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))}
                placeholder="e.g., BATCH001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicineId">Medicine ID *</Label>
              <Input
                id="medicineId"
                type="number"
                min="1"
                value={formData.medicineId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, medicineId: Number(e.target.value) }))}
                placeholder="Medicine ID from Medicines page"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                placeholder="Number of units"
                required
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> You can find the Medicine ID from the Medicines page. 
            Each medicine has a unique ID number.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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
