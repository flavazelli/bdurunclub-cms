import type { Access } from 'payload'

import { checkRole } from './checkRole'

export const admins: Access = ({ req: { user } }) => {
  if (!user) {
    return false // Deny access if the user is null
  }
  return checkRole(['admin'], user)
}
