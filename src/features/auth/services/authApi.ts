import { baseApi } from '@/services/baseApi'
import type { AuthResponse, AuthUser, UserRole } from '../types/authTypes'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length) {
      return v
    }
  }
  return null
}

function mapUser(raw: unknown): AuthUser | null {
  const o = asRecord(raw)
  if (!o) {
    return null
  }
  const id = pickString(o, ['id', '_id', 'userId']) ?? ''
  const email = pickString(o, ['email']) ?? ''
  const name = pickString(o, ['name', 'fullName', 'firstName']) ?? undefined
  const phone = pickString(o, ['phone', 'phoneNumber']) ?? undefined
  const r = pickString(o, ['role', 'userRole']) ?? 'vendor'
  const role: UserRole = r === 'service' || r === 'service_provider' ? 'service' : 'vendor'
  if (!email && !id) {
    return null
  }
  return { id: id || email, email, name, phone, role }
}

export function normalizeAuthResponse(body: unknown): AuthResponse {
  const o = asRecord(body) ?? {}
  const nested = asRecord(o.data) ?? o
  const token =
    pickString(nested, ['accessToken', 'token', 'access_token']) ?? pickString(o, ['accessToken', 'token'])
  if (!token) {
    throw new Error('Invalid auth response: missing token')
  }
  const userRaw = nested.user ?? o.user ?? nested
  let user = mapUser(userRaw)
  const emailOnly = pickString(nested, ['email']) ?? pickString(o, ['email'])
  if (!user && emailOnly) {
    const r = pickString(nested, ['role']) ?? 'vendor'
    const role: UserRole = r === 'service' || r === 'service_provider' ? 'service' : 'vendor'
    user = { id: emailOnly, email: emailOnly, role }
  }
  if (!user) {
    throw new Error('Invalid auth response: missing user')
  }
  return { token, user }
}

export type RegisterBody = {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string; role: UserRole }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (raw: unknown) => normalizeAuthResponse(raw),
    }),
    register: build.mutation<{ ok: true }, RegisterBody>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: () => ({ ok: true as const }),
    }),
    sendOtp: build.mutation<{ ok: true }, { email: string }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
      transformResponse: () => ({ ok: true as const }),
    }),
    verifyOtp: build.mutation<{ ok: true }, { email: string; otp: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      transformResponse: () => ({ ok: true as const }),
    }),
    resetPassword: build.mutation<{ ok: true }, { email: string; otp: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      transformResponse: () => ({ ok: true as const }),
    }),
  }),
  overrideExisting: false,
})

export const { useLoginMutation, useRegisterMutation, useSendOtpMutation, useVerifyOtpMutation, useResetPasswordMutation } = authApi
