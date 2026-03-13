import {
  assertMethod,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
} from '../../_lib/admin.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET', 'POST'])) {
    return
  }

  const authUser = await requireAdminUser(req, res)

  if (!authUser) {
    return
  }

  if (req.method === 'GET') {
    const page = Math.max(Number(req.query.page ?? 1), 1)
    const perPage = Math.min(Math.max(Number(req.query.perPage ?? 100), 1), 1000)

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      sendJson(res, 500, { error: error.message })
      return
    }

    sendJson(res, 200, {
      page,
      perPage,
      users: data.users.map((user) => ({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        emailConfirmedAt: user.email_confirmed_at,
        isAnonymous: user.is_anonymous,
        bannedUntil: user.banned_until,
      })),
    })
    return
  }

  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  const emailConfirm = Boolean(req.body?.emailConfirm ?? true)
  const allowSignIn = req.body?.allowSignIn === undefined ? true : Boolean(req.body?.allowSignIn)

  if (!email) {
    sendJson(res, 400, { error: 'Email is required.' })
    return
  }

  if (password.length < 8) {
    sendJson(res, 400, { error: 'Password must be at least 8 characters.' })
    return
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: emailConfirm,
  })

  if (error || !data.user) {
    sendJson(res, 500, { error: error?.message ?? 'User creation failed.' })
    return
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
      sendJson(res, 500, {
        error: blockError?.message ?? 'User created but sign-in toggle failed.',
      })
      return
    }

    createdUser = blockedData.user
  }

  sendJson(res, 201, {
    user: {
      id: createdUser.id,
      email: createdUser.email,
      createdAt: createdUser.created_at,
      emailConfirmedAt: createdUser.email_confirmed_at,
      bannedUntil: createdUser.banned_until,
    },
  })
}
