"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, Eye, FileText, Calendar, User } from "lucide-react"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { getAllAppointmentsByDoctor } from "@/lib/api/services"
import type { AppointmentDetails } from "@/lib/api/types"

type PatientUI = {
  id: string
  name: string
  email: string
  phone: string
  totalAppointments: number
  lastAppointment: string
}

export default function DoctorPatients() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [patients, setPatients] = useState<PatientUI[]>([])

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const query = searchQuery.toLowerCase()
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query)
      )
    })
  }, [patients, searchQuery])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleViewDetails = (patientId: string) => {
    router.push(`/patient/appointments/${patientId}`)
  }

  const handleViewMedicalRecords = (patientId: string) => {
    router.push(`/appointments/medical-record/history/${patientId}`)
  }

  const loadPatients = async () => {
    try {
      const token = getToken()
      if (!token) return

      const profileId = getProfileIdFromToken(token)
      if (!profileId) return

      const appointments = await getAllAppointmentsByDoctor(profileId)
      if (!appointments || appointments.length === 0) {
        setPatients([])
        setIsLoading(false)
        return
      }

      const patientMap = new Map<string, PatientUI>()

      for (const appt of appointments) {
        const patientId = String(appt.patientId)
        const patientName = appt.patientName || "Unknown"
        const patientEmail = appt.patientEmail || "N/A"
        const patientPhone = appt.patientPhone || "N/A"

        if (patientMap.has(patientId)) {
          const existing = patientMap.get(patientId)!
          existing.totalAppointments += 1
          if (new Date(appt.appointmentTime) > new Date(existing.lastAppointment)) {
            existing.lastAppointment = appt.appointmentTime
          }
        } else {
          patientMap.set(patientId, {
            id: patientId,
            name: patientName,
            email: patientEmail,
            phone: patientPhone,
            totalAppointments: 1,
            lastAppointment: appt.appointmentTime,
          })
        }
      }

      setPatients(Array.from(patientMap.values()))
    } catch (error) {
      console.error("Failed to load patients:", error)
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const totalPatients = patients.length

  return (
    <AppLayout roleLabel="Doctor" title="My Patients">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Patients</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your patients
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
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Search Patients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
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
              Patient List ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading patients...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Total Appointments</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Last Appointment</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src="" alt={patient.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{patient.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{patient.email}</td>
                          <td className="py-3 px-4 text-muted-foreground">{patient.phone}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{patient.totalAppointments}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(patient.lastAppointment)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleViewDetails(patient.id)}
                                title="View Details"
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleViewMedicalRecords(patient.id)}
                                title="Medical Records"
                              >
                                <FileText className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleViewDetails(patient.id)}
                                title="Appointments"
                              >
                                <Calendar className="size-4" />
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
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src="" alt={patient.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-lg">{patient.name}</p>
                            <p className="text-sm text-blue-600 font-mono">#{patient.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleViewDetails(patient.id)}
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleViewMedicalRecords(patient.id)}
                            title="Medical Records"
                          >
                            <FileText className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleViewDetails(patient.id)}
                            title="Appointments"
                          >
                            <Calendar className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{patient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{patient.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Appointments:</span>
                          <Badge variant="outline" className="text-xs">{patient.totalAppointments}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Appointment:</span>
                          <span className="font-medium">{formatDate(patient.lastAppointment)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredPatients.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No patients found matching your criteria.
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
