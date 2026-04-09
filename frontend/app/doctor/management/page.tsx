"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Stethoscope,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Award,
  Building,
} from "lucide-react"
import { getAllDoctors, deleteDoctor } from "@/lib/api/services"
import { AddDoctorModal } from "./add-doctor-modal"
import { EditDoctorModal } from "./edit-doctor-modal"

type DoctorUI = {
  id: string
  name: string
  email: string
  phone: string
  dob: string
  address: string
  licenseNo: string
  specialization: string
  department: string
  totalExp: number
  education: string
}

export default function DoctorManagement() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctorRows, setDoctorRows] = useState<DoctorUI[]>([])

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctorRows
    const query = searchQuery.toLowerCase()
    return doctorRows.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query) ||
        d.specialization.toLowerCase().includes(query) ||
        d.department.toLowerCase().includes(query) ||
        d.id.includes(query)
    )
  }, [doctorRows, searchQuery])

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const doctors = await getAllDoctors()
      const mapped: DoctorUI[] = (doctors ?? []).map((doctor) => ({
        id: String(doctor.id ?? ""),
        name: doctor.name ?? "Unknown",
        email: doctor.email ?? "",
        phone: doctor.phone ?? "",
        dob: doctor.dob ?? "",
        address: doctor.address ?? "",
        licenseNo: doctor.licenseNo ?? "",
        specialization: doctor.specialization ?? "",
        department: doctor.department ?? "",
        totalExp: doctor.totalExp ?? 0,
        education: doctor.education ?? "",
      }))
      setDoctorRows(mapped)
    } catch (error) {
      console.error("Failed to load doctors:", error)
      setDoctorRows([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      await deleteDoctor(Number(id))
      setSuccessMessage("Doctor deleted successfully.")
      loadDoctors()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to delete doctor:", error)
      alert("Failed to delete doctor")
    }
  }

  const handleEdit = (id: string) => {
    setSelectedDoctorId(Number(id))
    setIsEditModalOpen(true)
  }

  const handleViewDetails = (id: string) => {
    router.push(`/doctor/appointments`)
  }

  const handleDoctorAdded = () => {
    loadDoctors()
    setSuccessMessage("Doctor added successfully.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDoctorUpdated = () => {
    loadDoctors()
    setSuccessMessage("Doctor updated successfully.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalDoctors = doctorRows.length
  const specialists = doctorRows.filter((d) => d.specialization).length

  return (
    <AppLayout roleLabel="Admin" title="Doctor Management">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage doctor records
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Doctor
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Stethoscope className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDoctors}</p>
                    <p className="text-sm text-muted-foreground">Total Doctors</p>
                  </div>
                </div>
                <div className="size-4 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Award className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{specialists}</p>
                    <p className="text-sm text-muted-foreground">Specialists</p>
                  </div>
                </div>
                <div className="size-4 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-sm font-medium">Search Doctors</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, specialization, department, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5 text-primary" />
              Doctor Records ({filteredDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading doctors...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Specialization</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Experience</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">License No</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">#{doctor.id}</td>
                          <td className="py-3 px-4 font-medium">{doctor.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{doctor.email || "N/A"}</td>
                          <td className="py-3 px-4 text-muted-foreground">{doctor.phone || "N/A"}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{doctor.specialization || "N/A"}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{doctor.department || "N/A"}</td>
                          <td className="py-3 px-4 text-muted-foreground">{doctor.totalExp ? `${doctor.totalExp} years` : "N/A"}</td>
                          <td className="py-3 px-4 text-muted-foreground">{doctor.licenseNo || "N/A"}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="size-8" onClick={() => handleViewDetails(doctor.id)}>
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleEdit(doctor.id)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doctor.id)}
                                className="size-8 text-red-600"
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
                  {filteredDoctors.map((doctor) => (
                    <Card key={doctor.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{doctor.name}</p>
                          <p className="text-sm text-blue-600 font-mono">#{doctor.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleViewDetails(doctor.id)}>
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(doctor.id)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doctor.id)} className="size-8 text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{doctor.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{doctor.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Specialization:</span>
                          <Badge variant="outline" className="text-xs">{doctor.specialization || "N/A"}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">{doctor.department || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="font-medium">{doctor.totalExp ? `${doctor.totalExp} years` : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">License No:</span>
                          <span className="font-medium">{doctor.licenseNo || "N/A"}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredDoctors.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No doctors found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Doctor Modal */}
        <AddDoctorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDoctorAdded={handleDoctorAdded}
        />

        {/* Edit Doctor Modal */}
        <EditDoctorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDoctorId(null)
          }}
          onDoctorUpdated={handleDoctorUpdated}
          doctorId={selectedDoctorId}
        />
      </div>
    </AppLayout>
  )
}
