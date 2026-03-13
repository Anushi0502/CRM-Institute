import { randomUUID } from 'node:crypto'
import {
  assertMethod,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
} from '../../../_lib/admin.js'

const validTuitionStatuses = new Set(['Current', 'Review'])

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

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'POST'])) {
    return
  }

  const authUser = await requireAdminUser(req, res)

  if (!authUser) {
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('crm_students')
      .select(
        'id, name, guardian, program, attendance, pickup_window, support_focus, tuition_status, milestone, created_at',
      )
      .order('created_at', { ascending: false })

    if (error) {
      sendJson(res, 500, { error: error.message })
      return
    }

    sendJson(res, 200, {
      students: (data ?? []).map(mapStudentRow),
    })
    return
  }

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
    sendJson(res, 400, {
      error:
        'name, guardian, program, attendance, pickupWindow, supportFocus, and milestone are required.',
    })
    return
  }

  if (!validTuitionStatuses.has(tuitionStatus)) {
    sendJson(res, 400, { error: 'tuitionStatus must be "Current" or "Review".' })
    return
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
    sendJson(res, 500, { error: error?.message ?? 'Student creation failed.' })
    return
  }

  sendJson(res, 201, {
    student: mapStudentRow(data),
  })
}
