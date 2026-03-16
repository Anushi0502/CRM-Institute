import { hasSupabaseConfig, supabase } from './supabase'

const backendApiRaw = String(import.meta.env.VITE_BACKEND_API_URL ?? '').trim()

function normalizeBackendApiBase(input: string) {
  const unquoted = input.replace(/^['"]|['"]$/g, '').trim()

  if (!unquoted) {
    return ''
  }

  if (unquoted.startsWith('/')) {
    return unquoted.replace(/\/$/, '')
  }

  const looksLikeLocalHost = /^(localhost|127(?:\.\d{1,3}){3})(:\d+)?(\/.*)?$/i.test(unquoted)
  const withProtocol =
    /^[a-z][a-z\d+\-.]*:\/\//i.test(unquoted) || !looksLikeLocalHost
      ? unquoted
      : `http://${unquoted}`

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

const backendApiBase = normalizeBackendApiBase(backendApiRaw)
const hasBackendApiConfigError = Boolean(backendApiRaw) && !backendApiBase

export const backendEndpointLabel = hasBackendApiConfigError
  ? `invalid VITE_BACKEND_API_URL (${backendApiRaw}) -> same-origin (/api/backend)`
  : backendApiBase || 'same-origin (/api/backend)'

export interface BackendUser {
  id: string
  email: string | null
  createdAt: string
  lastSignInAt: string | null
  emailConfirmedAt: string | null
  isAnonymous: boolean | null
  bannedUntil: string | null
  appRole: 'admin' | 'parent'
}

interface UsersResponse {
  users: BackendUser[]
}

export interface BackendAccess {
  email: string | null
  isAdmin: boolean
  appRole: 'admin' | 'parent'
}

export interface CreateBackendUserInput {
  email: string
  password: string
  allowSignIn?: boolean
  appRole?: 'admin' | 'parent'
}

export type BackendStudentTuitionStatus = 'Current' | 'Review'

export interface BackendStudent {
  id: string
  name: string
  guardian: string
  program: string
  attendance: string
  pickupWindow: string
  supportFocus: string
  tuitionStatus: BackendStudentTuitionStatus
  milestone: string
  createdAt: string
}

export interface CreateBackendStudentInput {
  id?: string
  name: string
  guardian: string
  program: string
  attendance: string
  pickupWindow: string
  supportFocus: string
  tuitionStatus: BackendStudentTuitionStatus
  milestone: string
}

interface StudentsResponse {
  students: BackendStudent[]
}

function getTokenExpiryEpoch(token: string) {
  try {
    const payloadSegment = token.split('.')[1]

    if (!payloadSegment) {
      return null
    }

    const base64Payload = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64Payload)) as { exp?: number }

    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isTokenExpired(token: string, skewSeconds = 30) {
  const expiryEpoch = getTokenExpiryEpoch(token)

  if (!expiryEpoch) {
    return false
  }

  const nowEpoch = Math.floor(Date.now() / 1000)
  return expiryEpoch <= nowEpoch + skewSeconds
}

async function getAccessToken(forceRefresh = false) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured yet.')
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  const token = data.session?.access_token ?? ''

  if (forceRefresh || !token || isTokenExpired(token)) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      throw new Error('Session expired. Please sign out and sign in again.')
    }

    const refreshedToken = refreshData.session?.access_token

    if (!refreshedToken) {
      throw new Error('Session expired. Please sign out and sign in again.')
    }

    return refreshedToken
  }

  return token
}

function isLocalRuntime() {
  if (typeof window === 'undefined') {
    return false
  }

  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'
}

function unreachableBackendMessage(target: string) {
  if (isLocalRuntime()) {
    return `Cannot reach project admin routes (${target}). Use the local Vite app with /api routes, or point VITE_BACKEND_API_URL at a deployed project API origin.`
  }

  return `Cannot reach project admin routes (${target}). Check your deployed /api routes or Supabase-backed admin integration.`
}

function toFriendlyBackendError(raw: string, status: number) {
  const cleaned = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const target = backendApiBase || 'same-origin /api proxy'
  const lower = cleaned.toLowerCase()
  const looksLikeNetworkProxyFailure =
    lower.includes('proxy error') ||
    lower.includes('econnrefused') ||
    lower.includes('connection refused') ||
    lower.includes('connect error')

  if (
    lower.includes('invalid or expired token') ||
    lower.includes('jwt expired') ||
    lower.includes('invalid jwt') ||
    lower.includes('missing bearer token')
  ) {
    return 'Session expired. Please sign out and sign in again.'
  }

  // Prefer explicit backend JSON errors (even with 5xx) over generic reachability text.
  if (cleaned && !looksLikeNetworkProxyFailure) {
    return cleaned
  }

  if (status >= 500 || looksLikeNetworkProxyFailure) {
    return unreachableBackendMessage(target)
  }

  return `Backend request failed (${status}).`
}

async function executeBackendFetch(path: string, init: RequestInit | undefined, accessToken: string) {
  try {
    return await fetch(`${backendApiBase}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Network request failed.'
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('did not match the expected pattern')) {
      const target = backendApiBase || 'same-origin /api proxy'
      throw new Error(
        `Admin route URL is invalid (${target}). Set VITE_BACKEND_API_URL to a valid deployed app origin like "https://your-app-domain.com" or leave it blank for same-origin /api routes.`,
      )
    }

    if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('load failed')) {
      const target = backendApiBase || 'same-origin /api proxy'
      throw new Error(unreachableBackendMessage(target))
    }

    throw error
  }
}

async function backendRequest<T>(path: string, init?: RequestInit) {
  let accessToken = await getAccessToken()
  let response = await executeBackendFetch(path, init, accessToken)

  if (response.status === 401) {
    try {
      accessToken = await getAccessToken(true)
      response = await executeBackendFetch(path, init, accessToken)
    } catch {
      // Let the existing 401 response below surface as a friendly auth error.
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  let payload: { error?: string } | undefined
  let fallbackText = ''

  if (contentType.toLowerCase().includes('application/json')) {
    try {
      payload = (await response.json()) as { error?: string }
    } catch {
      payload = undefined
    }
  } else {
    try {
      fallbackText = await response.text()
    } catch {
      fallbackText = ''
    }
  }

  if (!response.ok) {
    throw new Error(toFriendlyBackendError(payload?.error ?? fallbackText, response.status))
  }

  if (payload === undefined) {
    throw new Error(`Backend response was empty (${response.status}) for ${path}.`)
  }

  return payload as T
}

export async function listBackendUsers() {
  const payload = await backendRequest<UsersResponse>('/api/backend/users')
  return payload.users
}

export async function getBackendAccess() {
  return backendRequest<BackendAccess>('/api/backend/access')
}

export async function createBackendUser(input: CreateBackendUserInput) {
  return backendRequest<{ user: BackendUser }>('/api/backend/users', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      emailConfirm: true,
      allowSignIn: input.allowSignIn ?? true,
      appRole: input.appRole ?? 'parent',
    }),
  })
}

export async function updateBackendUserSignIn(userId: string, allowSignIn: boolean) {
  return backendRequest<{ user: BackendUser }>(`/api/backend/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ allowSignIn }),
  })
}

export async function updateBackendUserRole(userId: string, appRole: 'admin' | 'parent') {
  return backendRequest<{ user: BackendUser }>(`/api/backend/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ appRole }),
  })
}

export async function deleteBackendUser(userId: string) {
  await backendRequest(`/api/backend/users/${userId}`, {
    method: 'DELETE',
  })
}

export async function listBackendStudents() {
  const payload = await backendRequest<StudentsResponse>('/api/backend/students')
  return payload.students
}

export async function createBackendStudent(input: CreateBackendStudentInput) {
  return backendRequest<{ student: BackendStudent }>('/api/backend/students', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteBackendStudent(studentId: string) {
  await backendRequest(`/api/backend/students/${studentId}`, {
    method: 'DELETE',
  })
}
