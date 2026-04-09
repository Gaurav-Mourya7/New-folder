"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { getProfileIdFromToken, getToken } from "@/lib/api/auth"

export default function PatientMedicalHistory() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPatientId = async () => {
      try {
        const token = getToken()
        if (!token) {
          router.push("/auth/login")
          return
        }

        const profileId = getProfileIdFromToken(token)
        if (profileId) {
          router.push(`/appointments/medical-record/history/${profileId}`)
        }
      } catch (error) {
        console.error("Failed to load patient ID:", error)
        setIsLoading(false)
      }
    }

    loadPatientId()
  }, [router])

  return (
    <AppLayout roleLabel="Patient" title="Medical Records">
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your medical records...</p>
        </div>
      </div>
    </AppLayout>
  )
}
