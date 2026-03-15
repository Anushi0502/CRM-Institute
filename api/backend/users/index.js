import {
  assertMethod,
  formatBackendUserSyncError,
  listBackendUsersPage,
  mapAuthUser,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
  upsertBackendUserRecord,
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

    try {
      const users = await listBackendUsersPage(page, perPage)
      sendJson(res, 200, {
        page,
        perPage,
        users,
      })
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : 'User list failed.',
      })
    }
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

  try {
    const syncedUser = await upsertBackendUserRecord(createdUser)
    sendJson(res, 201, { user: syncedUser })
  } catch (syncError) {
    sendJson(res, 500, {
      error: formatBackendUserSyncError(
        'User was created in Supabase Auth but failed to sync crm_backend_users.',
        syncError,
      ),
      user: mapAuthUser(createdUser),
    })
  }
}
