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
}

interface UsersResponse {
  users: BackendUser[]
}

export interface CreateBackendUserInput {
  email: string
  password: string
  allowSignIn?: boolean
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

async function getAccessToken() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured yet.')
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  const token = data.session?.access_token

  if (!token) {
    throw new Error('No active session token found.')
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
    return `Cannot reach backend API (${target}). Start it with "npm run dev" (or "npm run backend:dev").`
  }

  return `Cannot reach backend API (${target}). Check deployment API routes and env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BACKEND_ADMIN_EMAILS).`
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

  // Prefer explicit backend JSON errors (even with 5xx) over generic reachability text.
  if (cleaned && !looksLikeNetworkProxyFailure) {
    return cleaned
  }

  if (status >= 500 || looksLikeNetworkProxyFailure) {
    return unreachableBackendMessage(target)
  }

  return `Backend request failed (${status}).`
}

async function backendRequest<T>(path: string, init?: RequestInit) {
  const accessToken = await getAccessToken()
  let response: Response

  try {
    response = await fetch(`${backendApiBase}${path}`, {
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
        `Backend URL is invalid (${target}). Set VITE_BACKEND_API_URL to a valid URL like "http://127.0.0.1:8787" or leave it blank for same-origin.`,
      )
    }

    if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('load failed')) {
      const target = backendApiBase || 'same-origin /api proxy'
      throw new Error(unreachableBackendMessage(target))
    }

    throw error
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

export async function createBackendUser(input: CreateBackendUserInput) {
  return backendRequest<{ user: BackendUser }>('/api/backend/users', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      emailConfirm: true,
      allowSignIn: input.allowSignIn ?? true,
    }),
  })
}

export async function updateBackendUserSignIn(userId: string, allowSignIn: boolean) {
  return backendRequest<{ user: BackendUser }>(`/api/backend/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ allowSignIn }),
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
