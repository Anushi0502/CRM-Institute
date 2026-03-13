import {
  assertMethod,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
} from '../../_lib/admin.js'

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

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['PATCH', 'DELETE'])) {
    return
  }

  const authUser = await requireAdminUser(req, res)

  if (!authUser) {
    return
  }

  const userId = String(req.query.userId ?? '').trim()

  if (!userId) {
    sendJson(res, 400, { error: 'User id is required.' })
    return
  }

  if (req.method === 'PATCH') {
    const allowSignIn = req.body?.allowSignIn === undefined ? true : Boolean(req.body?.allowSignIn)

    if (!allowSignIn && authUser.id === userId) {
      sendJson(res, 400, { error: 'You cannot block your own active account.' })
      return
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: allowSignIn ? 'none' : '876000h',
    })

    if (error || !data.user) {
      sendJson(res, 500, { error: error?.message ?? 'Signin toggle failed.' })
      return
    }

    sendJson(res, 200, {
      user: mapAuthUser(data.user),
    })
    return
  }

  if (authUser.id === userId) {
    sendJson(res, 400, { error: 'You cannot delete your own active account.' })
    return
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    sendJson(res, 500, { error: error.message })
    return
  }

  res.status(204).end()
}
