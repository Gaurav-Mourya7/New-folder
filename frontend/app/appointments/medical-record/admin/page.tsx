"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Search,
  User,
  Stethoscope,
  Calendar,
  Eye,
} from "lucide-react"
import { getAllPatients } from "@/lib/api/services"
import { getApRecordsByPatientId } from "@/lib/api/services"
import type { RecordDetails } from "@/lib/api/types"

type MedicalRecordUI = {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  createdAt: string
  symptoms: string[]
  diagnosis: string
  tests: string[]
}

export default function AdminMedicalRecords() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState<MedicalRecordUI[]>([])

  const loadRecords = async () => {
    try {
      // Get all patients
      const patients = await getAllPatients()
      if (!patients || patients.length === 0) {
        setRecords([])
        setIsLoading(false)
        return
      }

      // Get medical records for each patient
      const allRecords: MedicalRecordUI[] = []
      for (const patient of patients) {
        if (!patient.id) continue
        try {
          const patientRecords = await getApRecordsByPatientId(patient.id)
          if (patientRecords && patientRecords.length > 0) {
            const mapped = patientRecords.map((record: RecordDetails) => ({
              id: String(record.id),
              patientId: String(record.patientId),
              patientName: patient.name || "Unknown",
              doctorName: record.doctorName || "Unknown",
              createdAt: record.createdAt || "",
              symptoms: record.symptoms || [],
              diagnosis: record.diagnosis || "",
              tests: record.tests || [],
            }))
            allRecords.push(...mapped)
          }
        } catch (error) {
          console.error(`Failed to load records for patient ${patient.id}:`, error)
        }
      }

      setRecords(allRecords)
    } catch (error) {
      console.error("Failed to load medical records:", error)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      record.patientName.toLowerCase().includes(query) ||
      record.doctorName.toLowerCase().includes(query) ||
      record.diagnosis.toLowerCase().includes(query) ||
      record.id.includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalRecords = records.length

  const handleViewDetails = (patientId: string) => {
    router.push(`/appointments/medical-record/history/${patientId}`)
  }

  return (
    <AppLayout roleLabel="Admin" title="Medical Records Management">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all medical records
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRecords}</p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
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
              <Label htmlFor="search" className="text-sm font-medium">Search Records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by patient name, doctor name, diagnosis, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              All Medical Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading medical records...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Doctor</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Diagnosis</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Symptoms</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">#{record.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-muted-foreground" />
                              <div className="font-medium">{record.patientName}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="size-4 text-muted-foreground" />
                              <div className="font-medium">{record.doctorName}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-muted-foreground" />
                              {formatDate(record.createdAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                            {record.diagnosis || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {record.symptoms.slice(0, 2).map((symptom, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                              {record.symptoms.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{record.symptoms.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleViewDetails(record.patientId)}
                              >
                                <Eye className="size-4" />
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
                  {filteredRecords.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{record.patientName}</p>
                          <p className="text-sm text-blue-600 font-mono">#{record.id}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(record.patientId)}
                          className="size-8"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="size-4 text-muted-foreground" />
                          <span className="font-medium">{record.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formatDate(record.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diagnosis:</span>
                          <span className="font-medium truncate max-w-[200px]">{record.diagnosis || "N/A"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Symptoms:</span>
                          <div className="flex flex-wrap gap-1">
                            {record.symptoms.slice(0, 3).map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                            {record.symptoms.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.symptoms.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredRecords.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No medical records found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
