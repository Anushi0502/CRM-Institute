import { hasSupabaseConfig, supabase } from './supabase'

const backendApiBase = (import.meta.env.VITE_BACKEND_API_URL ?? '').replace(/\/$/, '')

export const backendEndpointLabel = backendApiBase || 'same-origin (/api/backend)'

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

    if (message.toLowerCase().includes('failed to fetch')) {
      const target = backendApiBase || 'same-origin /api proxy'
      throw new Error(
        `Cannot reach backend API (${target}). Start it with "npm run backend:dev" or "npm run dev:full".`,
      )
    }

    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json()) as { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Backend request failed.')
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
  return backendRequest<{ user: BackendUser }>(`/api/backend/users/${userId}/signin`, {
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
