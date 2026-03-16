import {
  assertMethod,
  getAuthenticatedUser,
  resolveAppRole,
  sendJson,
} from '../_lib/admin.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET'])) {
    return
  }

  const authUser = await getAuthenticatedUser(req, res)

  if (!authUser) {
    return
  }

  const email = authUser.email?.toLowerCase() ?? ''
  const appRole = await resolveAppRole(authUser.id, email)

  sendJson(res, 200, {
    email: authUser.email ?? null,
    isAdmin: appRole === 'admin',
    appRole,
  })
}
