import { getToken } from "./auth"

declare const process: any

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000"

export class ApiError extends Error {
  status?: number
  body?: unknown

  constructor(message: string, opts?: { status?: number; body?: unknown }) {
    super(message)
    this.name = "ApiError"
    this.status = opts?.status
    this.body = opts?.body
  }
}

function toQueryString(
  query?: Record<
    string,
    string | number | boolean | Array<string | number | boolean> | undefined
  >
): string {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v))
    } else {
      params.set(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

async function parseErrorBody(resp: Response): Promise<unknown> {
  const contentType = resp.headers.get("content-type") ?? ""
  try {
    if (contentType.includes("application/json")) return await resp.json()
    return await resp.text()
  } catch {
    return undefined
  }
}

async function request(
  path: string,
  init: RequestInit & { auth?: boolean; query?: Parameters<typeof toQueryString>[0] },
  responseType: "json" | "text" | "blob" = "json"
): Promise<unknown> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}${toQueryString(
    init.query
  )}`

  const headers = new Headers(init.headers)

  if (init.auth) {
    const token = getToken()
    if (!token) throw new ApiError("Not authenticated: missing token")
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Only set JSON headers if we're sending a JSON payload.
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  }

  const resp = await fetch(url, { ...init, headers })
  if (!resp.ok) {
    const body = await parseErrorBody(resp)
    const msg =
      typeof body === "string"
        ? body
        : (body as any)?.message ??
          (body as any)?.error ??
          (body as any)?.errorMessage ??
          `Request failed (${resp.status})`
    throw new ApiError(msg, { status: resp.status, body })
  }

  if (responseType === "text") return await resp.text()
  if (responseType === "blob") return await resp.blob()

  const contentType = resp.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    // Some endpoints might still return JSON without correct content-type; try anyway.
    return await resp.text().then((t) => {
      try {
        return JSON.parse(t)
      } catch {
        return t
      }
    })
  }
  return await resp.json()
}

export async function requestJson<T>(
  path: string,
  init: RequestInit & { auth?: boolean; query?: Parameters<typeof toQueryString>[0] }
): Promise<T> {
  return (await request(path, init, "json")) as T
}

export async function requestText(
  path: string,
  init: RequestInit & { auth?: boolean; query?: Parameters<typeof toQueryString>[0] }
): Promise<string> {
  return (await request(path, init, "text")) as string
}

export async function requestBlob(
  path: string,
  init: RequestInit & { auth?: boolean; query?: Parameters<typeof toQueryString>[0] }
): Promise<Blob> {
  return (await request(path, init, "blob")) as Blob
}

