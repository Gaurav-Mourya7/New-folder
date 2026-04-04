import type { Role } from "./types"

const AUTH_TOKEN_KEY = "auth_token"
/** Mirrors login state for optional middleware / cookie checks (5h, same as backend JWT). */
const AUTH_SESSION_COOKIE = "hms_auth"
const AUTH_SESSION_MAX_AGE = 5 * 60 * 60

interface JwtPayload {
  id?: number
  email?: string
  role?: string
  name?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${AUTH_SESSION_MAX_AGE}; SameSite=Lax`
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0`
}

/** Call on app load so refresh keeps session cookie in sync with localStorage JWT. */
export function syncAuthSessionCookie(): void {
  if (typeof window === "undefined") return
  if (window.localStorage.getItem(AUTH_TOKEN_KEY)) {
    document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${AUTH_SESSION_MAX_AGE}; SameSite=Lax`
  } else {
    document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0`
  }
}

function base64UrlDecode(input: string): string {
  // Convert base64url to base64, then decode.
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=")
  const atobFn =
    typeof window !== "undefined"
      ? window.atob.bind(window)
      : (globalThis as any).atob?.bind(globalThis)
  if (!atobFn) {
    throw new Error("atob is not available in this environment")
  }
  return atobFn(padded)
}

export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payloadJson = base64UrlDecode(parts[1])
    return JSON.parse(payloadJson) as JwtPayload
  } catch {
    return null
  }
}

export function getRoleFromToken(token: string): Role | null {
  const claims = decodeJwtToken(token)
  if (!claims) return null
  return (claims.role as Role | undefined) ?? null
}

export function getProfileIdFromToken(token: string): number | null {
  const claims = decodeJwtToken(token)
  const raw = (claims as any)?.profileId
  if (raw === undefined || raw === null) return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

