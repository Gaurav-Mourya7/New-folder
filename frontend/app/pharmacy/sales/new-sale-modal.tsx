"use client"

import { useState, useEffect } from "react"
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
import { Plus, Trash2, DollarSign } from "lucide-react"
import { createSale, getAllMedicines, getAllMedicineInventory } from "@/lib/api/services"

interface NewSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSaleCreated: () => void
}

interface SaleItem {
  medicineId: number
  medicineName: string
  batchNo: string
  quantity: number
  unitPrice: number
  total: number
}

export function NewSaleModal({ isOpen, onClose, onSaleCreated }: NewSaleModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [medicines, setMedicines] = useState<Array<{ id: number; name: string; price: number }>>([])
  const [inventory, setInventory] = useState<Array<{ id: number; medicineId: number; batchNo: string; quantity: number; medicine: { name: string } }>>([])
  const [selectedMedicine, setSelectedMedicine] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0)

  useEffect(() => {
    if (isOpen) {
      loadMedicines()
      loadInventory()
    }
  }, [isOpen])

  const loadMedicines = async () => {
    try {
      const data = await getAllMedicines()
      setMedicines((data ?? []).map(m => ({
        id: Number(m.id ?? 0),
        name: m.name ?? "",
        price: Number(m.unitPrice ?? 0)
      })))
    } catch (error) {
      console.error("Failed to load medicines:", error)
    }
  }

  const loadInventory = async () => {
    try {
      const data = await getAllMedicineInventory()
      // Transform the data to match the expected interface
      const transformedData = (data ?? []).map(item => ({
        id: Number(item.id ?? 0),
        medicineId: Number(item.medicineId ?? 0),
        batchNo: item.batchNo ?? "",
        quantity: Number(item.quantity ?? 0),
        medicine: { name: "Loading..." } // Placeholder, will be updated with actual medicine name
      }))
      setInventory(transformedData)
    } catch (error) {
      console.error("Failed to load inventory:", error)
    }
  }

  const getAvailableBatches = (medicineId: string) => {
    return inventory.filter(item => 
      item.medicineId === Number(medicineId) && 
      item.quantity > 0
    )
  }

  const getMedicinePrice = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === Number(medicineId))
    return medicine?.price || 0
  }

  const addSaleItem = () => {
    if (!selectedMedicine || !selectedBatch || quantity <= 0) {
      alert("Please select medicine, batch, and quantity")
      return
    }

    const batch = inventory.find(item => item.batchNo === selectedBatch)
    if (!batch || batch.quantity < quantity) {
      alert("Insufficient stock for this batch")
      return
    }

    const unitPrice = getMedicinePrice(selectedMedicine)
    const newItem: SaleItem = {
      medicineId: Number(selectedMedicine),
      medicineName: batch.medicine.name,
      batchNo: selectedBatch,
      quantity,
      unitPrice,
      total: quantity * unitPrice
    }

    setSaleItems([...saleItems, newItem])
    setSelectedMedicine("")
    setSelectedBatch("")
    setQuantity(1)
  }

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName.trim() || saleItems.length === 0) {
      alert("Please enter customer name and add at least one item")
      return
    }

    setIsLoading(true)
    try {
      // Create sale
      const sale = await createSale({
        saleDate: new Date().toISOString(),
        totalAmount: totalAmount
      } as any)

      // Create sale items (you'll need to implement this API call)
      // await createSaleItems for each item
      
      onSaleCreated()
      onClose()
      
      // Reset form
      setCustomerName("")
      setPaymentMethod("CASH")
      setSaleItems([])
    } catch (error) {
      console.error("Failed to create sale:", error)
      alert("Failed to create sale")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper" sideOffset={5}>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4 pb-8">
            <h3 className="font-medium">Add Items</h3>
            
            <div className="flex gap-3 items-center">
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Medicine" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper" sideOffset={5}>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id.toString()}>
                      {medicine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedBatch} 
                onValueChange={setSelectedBatch}
                disabled={!selectedMedicine}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper" sideOffset={5}>
                  {getAvailableBatches(selectedMedicine).map((batch) => (
                    <SelectItem key={batch.id} value={batch.batchNo}>
                      <div className="flex flex-col">
                        <span>{batch.batchNo}</span>
                        <span className="text-xs text-muted-foreground">{batch.quantity} available</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Qty"
                disabled={!selectedBatch}
                className="w-20 text-center"
              />

              <Button 
                type="button" 
                onClick={addSaleItem}
                disabled={!selectedMedicine || !selectedBatch}
                className="gap-1"
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>

          {saleItems.length > 0 && (
            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-medium mb-3">Sale Items</h3>
              <div className="space-y-2">
                {saleItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.medicineName}</div>
                      <div className="text-sm text-muted-foreground">
                        Batch: {item.batchNo} | Qty: {item.quantity} | Price: ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${item.total.toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSaleItem(index)}
                        className="size-6 text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || saleItems.length === 0}
              className="gap-2"
            >
              <DollarSign className="size-4" />
              {isLoading ? "Creating..." : "Complete Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
