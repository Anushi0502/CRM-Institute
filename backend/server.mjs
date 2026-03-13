import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.backend' })
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const port = Number(process.env.BACKEND_PORT ?? 8787)
const adminEmails = (process.env.BACKEND_ADMIN_EMAILS ?? '')
  .split(',')
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean)

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.backend or .env',
  )
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const app = express()
const validTuitionStatuses = new Set(['Current', 'Review'])

app.use(cors({ origin: true }))
app.use(express.json())

function parseBearerToken(headerValue = '') {
  if (!headerValue.startsWith('Bearer ')) {
    return null
  }

  return headerValue.slice(7).trim()
}

function mapAuthUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    emailConfirmedAt: user.email_confirmed_at,
    isAnonymous: user.is_anonymous,
    bannedUntil: user.banned_until,
  }
}

function mapStudentRow(row) {
  return {
    id: row.id,
    name: row.name,
    guardian: row.guardian,
    program: row.program,
    attendance: row.attendance,
    pickupWindow: row.pickup_window,
    supportFocus: row.support_focus,
    tuitionStatus: row.tuition_status,
    milestone: row.milestone,
    createdAt: row.created_at,
  }
}

async function requireAdminUser(req, res, next) {
  const token = parseBearerToken(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token.' })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  const email = data.user.email?.toLowerCase() ?? ''

  if (adminEmails.length > 0 && !adminEmails.includes(email)) {
    return res.status(403).json({ error: 'This user is not allowed for backend admin.' })
  }

  req.authUser = data.user
  next()
}

app.get('/api/backend/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'crm-backend-admin',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/backend', requireAdminUser)

app.get('/api/backend/users', async (req, res) => {
  const page = Math.max(Number(req.query.page ?? 1), 1)
  const perPage = Math.min(Math.max(Number(req.query.perPage ?? 100), 1), 1000)

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage,
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({
    page,
    perPage,
    users: data.users.map(mapAuthUser),
  })
})

app.post('/api/backend/users', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  const emailConfirm = Boolean(req.body?.emailConfirm ?? true)
  const allowSignIn = req.body?.allowSignIn === undefined ? true : Boolean(req.body?.allowSignIn)

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: emailConfirm,
  })

  if (error || !data.user) {
    return res.status(500).json({ error: error?.message ?? 'User creation failed.' })
  }

  let createdUser = data.user

  if (!allowSignIn) {
    const { data: blockedData, error: blockError } = await supabaseAdmin.auth.admin.updateUserById(
      createdUser.id,
      {
        ban_duration: '876000h',
      },
    )

    if (blockError || !blockedData.user) {
      return res
        .status(500)
        .json({ error: blockError?.message ?? 'User created but sign-in toggle failed.' })
    }

    createdUser = blockedData.user
  }

  res.status(201).json({
    user: mapAuthUser(createdUser),
  })
})

app.patch('/api/backend/users/:userId/signin', async (req, res) => {
  const userId = String(req.params.userId ?? '').trim()
  const allowSignIn = req.body?.allowSignIn === undefined ? true : Boolean(req.body?.allowSignIn)

  if (!userId) {
    return res.status(400).json({ error: 'User id is required.' })
  }

  if (!allowSignIn && req.authUser?.id === userId) {
    return res.status(400).json({ error: 'You cannot block your own active account.' })
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: allowSignIn ? 'none' : '876000h',
  })

  if (error || !data.user) {
    return res.status(500).json({ error: error?.message ?? 'Signin toggle failed.' })
  }

  res.json({
    user: mapAuthUser(data.user),
  })
})

app.delete('/api/backend/users/:userId', async (req, res) => {
  const userId = String(req.params.userId ?? '').trim()

  if (!userId) {
    return res.status(400).json({ error: 'User id is required.' })
  }

  if (req.authUser?.id === userId) {
    return res.status(400).json({ error: 'You cannot delete your own active account.' })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(204).send()
})

app.get('/api/backend/students', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('crm_students')
    .select(
      'id, name, guardian, program, attendance, pickup_window, support_focus, tuition_status, milestone, created_at',
    )
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({
    students: (data ?? []).map(mapStudentRow),
  })
})

app.post('/api/backend/students', async (req, res) => {
  const id = String(req.body?.id ?? '').trim()
  const name = String(req.body?.name ?? '').trim()
  const guardian = String(req.body?.guardian ?? '').trim()
  const program = String(req.body?.program ?? '').trim()
  const attendance = String(req.body?.attendance ?? '').trim()
  const pickupWindow = String(req.body?.pickupWindow ?? '').trim()
  const supportFocus = String(req.body?.supportFocus ?? '').trim()
  const tuitionStatus = String(req.body?.tuitionStatus ?? '').trim()
  const milestone = String(req.body?.milestone ?? '').trim()

  if (
    !name ||
    !guardian ||
    !program ||
    !attendance ||
    !pickupWindow ||
    !supportFocus ||
    !milestone
  ) {
    return res.status(400).json({
      error:
        'name, guardian, program, attendance, pickupWindow, supportFocus, and milestone are required.',
    })
  }

  if (!validTuitionStatuses.has(tuitionStatus)) {
    return res.status(400).json({ error: 'tuitionStatus must be "Current" or "Review".' })
  }

  const studentId = id || `student-${randomUUID()}`

  const { data, error } = await supabaseAdmin
    .from('crm_students')
    .insert({
      id: studentId,
      name,
      guardian,
      program,
      attendance,
      pickup_window: pickupWindow,
      support_focus: supportFocus,
      tuition_status: tuitionStatus,
      milestone,
    })
    .select(
      'id, name, guardian, program, attendance, pickup_window, support_focus, tuition_status, milestone, created_at',
    )
    .single()

  if (error || !data) {
    return res.status(500).json({ error: error?.message ?? 'Student creation failed.' })
  }

  res.status(201).json({
    student: mapStudentRow(data),
  })
})

app.delete('/api/backend/students/:studentId', async (req, res) => {
  const studentId = String(req.params.studentId ?? '').trim()

  if (!studentId) {
    return res.status(400).json({ error: 'Student id is required.' })
  }

  const { error } = await supabaseAdmin.from('crm_students').delete().eq('id', studentId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(204).send()
})

app.listen(port, () => {
  console.log(`CRM backend admin running on http://127.0.0.1:${port}`)
})
