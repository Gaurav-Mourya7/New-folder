"use client"

import { useEffect, useMemo, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Mail,
} from "lucide-react"
import { getAllPatients, deletePatient } from "@/lib/api/services"
import { AddPatientModal } from "./add-patient-modal"
import { EditPatientModal } from "./edit-patient-modal"

type PatientUI = {
  id: string
  name: string
  email: string
  phone: string
  dob: string
  address: string
  city: string
  gender: string
  bloodGroup: string
  emergencyContact: string
  emergencyPhone: string
}

export default function PatientManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [patientRows, setPatientRows] = useState<PatientUI[]>([])

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patientRows
    const query = searchQuery.toLowerCase()
    return patientRows.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.id.includes(query)
    )
  }, [patientRows, searchQuery])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      const patients = await getAllPatients()
      const mapped: PatientUI[] = (patients ?? []).map((patient) => ({
        id: String(patient.id ?? ""),
        name: patient.name ?? "Unknown",
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        dob: patient.dob ?? "",
        address: patient.address ?? "",
        city: patient.city ?? "",
        gender: patient.gender ?? "",
        bloodGroup: patient.bloodGroup ?? "",
        emergencyContact: patient.emergencyContact ?? "",
        emergencyPhone: patient.emergencyPhone ?? "",
      }))
      setPatientRows(mapped)
    } catch (error) {
      console.error("Failed to load patients:", error)
      setPatientRows([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      await deletePatient(Number(id))
      setSuccessMessage("Patient deleted successfully.")
      loadPatients()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to delete patient:", error)
      alert("Failed to delete patient")
    }
  }

  const handlePatientAdded = () => {
    loadPatients()
    setSuccessMessage("Patient added successfully.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleEdit = (id: string) => {
    setSelectedPatientId(Number(id))
    setIsEditModalOpen(true)
  }

  const handlePatientUpdated = () => {
    loadPatients()
    setSuccessMessage("Patient updated successfully.")
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

  const totalPatients = patientRows.length
  const activePatients = patientRows.filter((p) => p.email).length

  return (
    <AppLayout roleLabel="Admin" title="Patient Management">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage patient records
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Add Patient
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
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
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
                    <Mail className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activePatients}</p>
                    <p className="text-sm text-muted-foreground">With Email</p>
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
              <Label htmlFor="search" className="text-sm font-medium">Search Patients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Patient Records ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading patients...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">DOB</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Gender</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Blood Group</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">City</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">#{patient.id}</td>
                        <td className="py-3 px-4 font-medium">{patient.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{patient.email || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{patient.phone || "N/A"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(patient.dob)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{patient.gender || "N/A"}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{patient.bloodGroup || "N/A"}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{patient.city || "N/A"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="size-8">
                              <Eye className="size-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-8"
                              onClick={() => handleEdit(patient.id)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(patient.id)}
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

                {filteredPatients.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No patients found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Patient Modal */}
        <AddPatientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onPatientAdded={handlePatientAdded}
        />

        {/* Edit Patient Modal */}
        <EditPatientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedPatientId(null)
          }}
          onPatientUpdated={handlePatientUpdated}
          patientId={selectedPatientId}
        />
      </div>
    </AppLayout>
  )
}
