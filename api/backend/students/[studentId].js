import {
  assertMethod,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
} from '../../_lib/admin.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['DELETE'])) {
    return
  }

  const authUser = await requireAdminUser(req, res)

  if (!authUser) {
    return
  }

  const studentId = String(req.query.studentId ?? '').trim()

  if (!studentId) {
    sendJson(res, 400, { error: 'Student id is required.' })
    return
  }

  const { error } = await supabaseAdmin.from('crm_students').delete().eq('id', studentId)

  if (error) {
    sendJson(res, 500, { error: error.message })
    return
  }

  res.status(204).end()
}
