import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmails = (process.env.BACKEND_ADMIN_EMAILS ?? '')
  .split(',')
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean)

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

  if (adminEmails.length > 0 && !adminEmails.includes(email)) {
    sendJson(res, 403, { error: 'This user is not allowed for backend admin.' })
    return null
  }

  return data.user
}

export { supabaseAdmin }
