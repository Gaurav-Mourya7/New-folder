export interface JwtPayload {
  id?: number
  email?: string
  role?: string
  name?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

