import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmails = (process.env.BACKEND_ADMIN_EMAILS ?? '')
  .split(',')
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean)
const backendUsersTableSelect =
  'id, email, created_at, last_sign_in_at, email_confirmed_at, is_anonymous, banned_until'
const missingUsersTableMessage =
  'Missing table "crm_backend_users". Run supabase/schema.sql in Supabase SQL Editor.'

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.')
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function parseBearerToken(headerValue = '') {
  if (!headerValue.startsWith('Bearer ')) {
    return null
  }

  return headerValue.slice(7).trim()
}

function isAllowedAdminEmail(email) {
  if (adminEmails.length === 0) {
    return true
  }

  return adminEmails.some((rule) => {
    if (rule === '*') {
      return true
    }

    if (rule.startsWith('*@')) {
      return email.endsWith(rule.slice(1))
    }

    if (rule.startsWith('@')) {
      return email.endsWith(rule)
    }

    return rule === email
  })
}

function isMissingUsersTableError(error) {
  const code = String(error?.code ?? '')
  const message = String(error?.message ?? '').toLowerCase()
  return code === '42P01' || message.includes('crm_backend_users')
}

function toBackendUsersTableErrorMessage(error) {
  if (isMissingUsersTableError(error)) {
    return missingUsersTableMessage
  }

  return String(error?.message ?? 'crm_backend_users request failed.')
}

function toIsoOrNull(value) {
  return value ? new Date(value).toISOString() : null
}

export function mapBackendUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
    emailConfirmedAt: row.email_confirmed_at,
    isAnonymous: row.is_anonymous,
    bannedUntil: row.banned_until,
  }
}

export function mapAuthUser(user) {
  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    emailConfirmedAt: user.email_confirmed_at,
    isAnonymous: user.is_anonymous,
    bannedUntil: user.banned_until,
  }
}

export function sendJson(res, statusCode, body) {
  res.status(statusCode).json(body)
}

export function assertMethod(req, res, allowedMethods) {
  if (allowedMethods.includes(req.method ?? '')) {
    return true
  }

  res.setHeader('Allow', allowedMethods)
  sendJson(res, 405, { error: 'Method Not Allowed' })
  return false
}

export async function requireAdminUser(req, res) {
  const token = parseBearerToken(req.headers.authorization ?? '')

  if (!token) {
    sendJson(res, 401, { error: 'Missing bearer token.' })
    return null
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    sendJson(res, 401, { error: 'Invalid or expired token.' })
    return null
  }

  const email = data.user.email?.toLowerCase() ?? ''

  if (!isAllowedAdminEmail(email)) {
    sendJson(res, 403, {
      error: `This user is not allowed for backend admin. Add "${email}" to BACKEND_ADMIN_EMAILS.`,
    })
    return null
  }

  return data.user
}

export async function listBackendUsersPage(page, perPage) {
  const start = (page - 1) * perPage
  const end = start + perPage - 1
  const loadFromTable = async () => {
    const { data, error } = await supabaseAdmin
      .from('crm_backend_users')
      .select(backendUsersTableSelect)
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) {
      if (isMissingUsersTableError(error)) {
        return null
      }

      throw new Error(toBackendUsersTableErrorMessage(error))
    }

    return data ?? []
  }

  let rows = await loadFromTable()

  if (rows === null) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw new Error(error.message)
    }

    return (data.users ?? []).map(mapAuthUser)
  }

  if (page === 1 && rows.length === 0) {
    const perPageLimit = 1000
    let cursor = 1
    let processedAny = false

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: cursor,
        perPage: perPageLimit,
      })

      if (error) {
        throw new Error(error.message)
      }

      const users = data.users ?? []

      if (users.length === 0) {
        break
      }

      processedAny = true
      const payload = users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
        created_at: toIsoOrNull(user.created_at) ?? new Date().toISOString(),
        last_sign_in_at: toIsoOrNull(user.last_sign_in_at),
        email_confirmed_at: toIsoOrNull(user.email_confirmed_at),
        is_anonymous: user.is_anonymous,
        banned_until: toIsoOrNull(user.banned_until),
        allow_sign_in: !user.banned_until,
        updated_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabaseAdmin
        .from('crm_backend_users')
        .upsert(payload, { onConflict: 'id' })

      if (upsertError) {
        throw new Error(toBackendUsersTableErrorMessage(upsertError))
      }

      if (users.length < perPageLimit) {
        break
      }

      cursor += 1
    }

    if (processedAny) {
      rows = await loadFromTable()
    }
  }

  return rows.map(mapBackendUserRow)
}

export async function upsertBackendUserRecord(user) {
  const mapped = mapAuthUser(user)
  const { error } = await supabaseAdmin.from('crm_backend_users').upsert(
    {
      id: mapped.id,
      email: mapped.email,
      created_at: toIsoOrNull(mapped.createdAt) ?? new Date().toISOString(),
      last_sign_in_at: toIsoOrNull(mapped.lastSignInAt),
      email_confirmed_at: toIsoOrNull(mapped.emailConfirmedAt),
      is_anonymous: mapped.isAnonymous,
      banned_until: toIsoOrNull(mapped.bannedUntil),
      allow_sign_in: !mapped.bannedUntil,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) {
    if (isMissingUsersTableError(error)) {
      return mapped
    }

    throw new Error(toBackendUsersTableErrorMessage(error))
  }

  return mapped
}

export async function deleteBackendUserRecord(userId) {
  const { error } = await supabaseAdmin.from('crm_backend_users').delete().eq('id', userId)

  if (error) {
    if (isMissingUsersTableError(error)) {
      return
    }

    throw new Error(toBackendUsersTableErrorMessage(error))
  }
}

export function formatBackendUserSyncError(prefix, error) {
  const message = error instanceof Error ? error.message : 'Unknown sync error.'
  return `${prefix} ${message}`
}

export { supabaseAdmin }
