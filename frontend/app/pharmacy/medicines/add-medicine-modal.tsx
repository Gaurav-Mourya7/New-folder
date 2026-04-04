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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.dosage) {
      alert("Please fill in all required fields")
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
      onClose()
    } catch (error) {
      console.error("Failed to add medicine:", error)
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Amoxicillin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg"
                required
              />
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
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="Manufacturer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
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
