import { assertMethod, sendJson } from '../_lib/admin.js'

export default async function handler(req, res) {
  if (!assertMethod(req, res, ['GET'])) {
    return
  }

  sendJson(res, 200, {
    status: 'ok',
    service: 'crm-backend-admin',
    timestamp: new Date().toISOString(),
  })
}
