"use client"

import { useEffect } from "react"
import { syncAuthSessionCookie } from "@/lib/api/auth"

/** Keeps `hms_auth` cookie aligned with JWT in localStorage (refresh / multi-tab). */
export function AuthCookieSync() {
  useEffect(() => {
    syncAuthSessionCookie()
  }, [])
  return null
}
