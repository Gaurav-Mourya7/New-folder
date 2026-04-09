"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Calendar,
  Stethoscope,
  ArrowLeft,
  Download,
  File,
} from "lucide-react"
import { getApRecordsByPatientId, getFile } from "@/lib/api/services"
import type { RecordDetails } from "@/lib/api/types"

export default function PatientMedicalHistory() {
  const params = useParams()
  const patientId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState<RecordDetails[]>([])

  useEffect(() => {
    loadRecords()
  }, [patientId])

  const loadRecords = async () => {
    try {
      const data = await getApRecordsByPatientId(Number(patientId))
      setRecords(data ?? [])
    } catch (error) {
      console.error("Failed to load medical records:", error)
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await getFile(fileId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName || `file-${fileId}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download file:", error)
      alert("Failed to download file")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AppLayout roleLabel="Patient" title="Medical History">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medical History</h1>
            <p className="text-muted-foreground mt-1">
              View complete medical records
            </p>
          </div>
        </div>

        {/* Records List */}
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading medical records...</div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No medical records found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      Medical Record #{record.id}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      {formatDate(record.createdAt || "")}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="size-4 text-muted-foreground" />
                    <span className="font-medium">Doctor:</span>
                    <span>{record.doctorName || "N/A"}</span>
                  </div>

                  {/* Symptoms */}
                  {record.symptoms && record.symptoms.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Symptoms:</div>
                      <div className="flex flex-wrap gap-2">
                        {record.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/10 text-primary">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {record.diagnosis && (
                    <div>
                      <div className="text-sm font-medium mb-1">Diagnosis:</div>
                      <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                    </div>
                  )}

                  {/* Tests */}
                  {record.tests && record.tests.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Tests Required:</div>
                      <div className="flex flex-wrap gap-2">
                        {record.tests.map((test, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div>
                      <div className="text-sm font-medium mb-1">Doctor's Notes:</div>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}

                  {/* Referral */}
                  {record.referral && (
                    <div>
                      <div className="text-sm font-medium mb-1">Referral:</div>
                      <p className="text-sm text-muted-foreground">{record.referral}</p>
                    </div>
                  )}

                  {/* Follow-up Date */}
                  {record.followUpDate && (
                    <div>
                      <div className="text-sm font-medium mb-1">Follow-up Date:</div>
                      <p className="text-sm text-muted-foreground">{formatDate(record.followUpDate)}</p>
                    </div>
                  )}

                  {/* Attached Documents */}
                  {record.mediaFileIds && record.mediaFileIds.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Attached Documents:</div>
                      <div className="space-y-2">
                        {record.mediaFileIds.map((fileId, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <File className="size-4 text-muted-foreground" />
                              <span className="text-sm">Document {index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleDownload(fileId, `document-${record.id}-${index + 1}`)}
                            >
                              <Download className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
