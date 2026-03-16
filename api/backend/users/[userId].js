import {
  assertMethod,
  deleteBackendUserRecord,
  formatBackendUserSyncError,
  mapAuthUser,
  requireAdminUser,
  sendJson,
  supabaseAdmin,
  upsertBackendUserRecord,
} from '../../_lib/admin.js'

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
    const appRole = req.body?.appRole === 'admin' ? 'admin' : req.body?.appRole === 'parent' ? 'parent' : undefined

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

    try {
      const syncedUser = await upsertBackendUserRecord(data.user, { appRole })
      sendJson(res, 200, { user: syncedUser })
    } catch (syncError) {
      sendJson(res, 500, {
        error: formatBackendUserSyncError(
          'Signin toggle succeeded in Supabase Auth but failed to sync crm_backend_users.',
          syncError,
        ),
        user: mapAuthUser(data.user),
      })
    }
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

  try {
    await deleteBackendUserRecord(userId)
  } catch (syncError) {
    sendJson(res, 500, {
      error: formatBackendUserSyncError(
        'User deleted from Supabase Auth but failed to remove from crm_backend_users.',
        syncError,
      ),
    })
    return
  }

  res.status(204).end()
}
