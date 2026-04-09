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

interface FormErrors {
  customerName?: string
  saleItems?: string
  medicine?: string
  batch?: string
  quantity?: string
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
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
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
    const newErrors: FormErrors = {}

    if (!selectedMedicine) {
      newErrors.medicine = "Please select a medicine"
    }

    if (!selectedBatch) {
      newErrors.batch = "Please select a batch"
    }

    if (quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const batch = inventory.find(item => item.batchNo === selectedBatch)
    if (!batch || batch.quantity < quantity) {
      setErrors({ quantity: "Insufficient stock for this batch" })
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
    setErrors({})
  }

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const newErrors: FormErrors = {}

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = "Customer name must be at least 2 characters"
    }

    if (saleItems.length === 0) {
      newErrors.saleItems = "Please add at least one item to the sale"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Create sale with items
      const sale = await createSale({
        saleDate: new Date().toISOString(),
        totalAmount: totalAmount,
        customerName: customerName,
        paymentMethod: paymentMethod,
        saleItems: saleItems.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          batchNo: item.batchNo,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.total
        }))
      } as any)

      onSaleCreated()
      onClose()

      // Reset form
      setCustomerName("")
      setPaymentMethod("CASH")
      setSaleItems([])
      setErrors({})
    } catch (error) {
      console.error("Failed to create sale:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create sale"
      setApiError(errorMessage)
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

        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value)
                  setErrors(prev => ({ ...prev, customerName: undefined }))
                }}
                placeholder="Enter customer name"
                className={errors.customerName ? "border-destructive" : ""}
              />
              {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
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
              <div className="flex-1 space-y-1">
                <Select value={selectedMedicine} onValueChange={(value) => {
                  setSelectedMedicine(value)
                  setErrors(prev => ({ ...prev, medicine: undefined }))
                }}>
                  <SelectTrigger className={errors.medicine ? "border-destructive" : ""}>
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
                {errors.medicine && <p className="text-sm text-destructive">{errors.medicine}</p>}
              </div>

              <div className="flex-1 space-y-1">
                <Select
                  value={selectedBatch}
                  onValueChange={(value) => {
                    setSelectedBatch(value)
                    setErrors(prev => ({ ...prev, batch: undefined }))
                  }}
                  disabled={!selectedMedicine}
                >
                  <SelectTrigger className={errors.batch ? "border-destructive" : ""}>
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
                {errors.batch && <p className="text-sm text-destructive">{errors.batch}</p>}
              </div>

              <div className="space-y-1">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(Number(e.target.value))
                    setErrors(prev => ({ ...prev, quantity: undefined }))
                  }}
                  placeholder="Qty"
                  disabled={!selectedBatch}
                  className={`w-20 text-center ${errors.quantity ? "border-destructive" : ""}`}
                />
                {errors.quantity && <p className="text-sm text-destructive text-center">{errors.quantity}</p>}
              </div>

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

          {errors.saleItems && (
            <p className="text-sm text-destructive">{errors.saleItems}</p>
          )}

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
