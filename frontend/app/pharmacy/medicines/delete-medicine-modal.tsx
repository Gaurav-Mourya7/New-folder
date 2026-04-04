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
import { AlertTriangle } from "lucide-react"

interface DeleteMedicineModalProps {
  isOpen: boolean
  onClose: () => void
  onDeleteMedicine: () => Promise<void>
  medicineName: string
  medicineId: number
}

export function DeleteMedicineModal({ 
  isOpen, 
  onClose, 
  onDeleteMedicine, 
  medicineName, 
  medicineId 
}: DeleteMedicineModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDeleteMedicine()
      onClose()
    } catch (error) {
      console.error("Failed to delete medicine:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            Delete Medicine
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-800">
                Are you sure you want to delete this medicine?
              </p>
              <div className="bg-white rounded p-3 border border-red-100">
                <p className="font-semibold">{medicineName}</p>
                <p className="text-sm text-muted-foreground">ID: #{medicineId}</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>⚠️ Warning:</strong> This action will:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Permanently delete the medicine</li>
              <li>Remove all associated stock records</li>
              <li>Cannot be undone</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Medicine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
