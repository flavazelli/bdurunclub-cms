import type { Access } from 'payload'

import { checkRole } from './checkRole'

const adminsAndUser: Access = ({ req: { user }, id }) => {
  if (user) {
    if (checkRole(['admin'], user)) {
      return true
    }

    return user.id === id
  }

  return false
}

export default adminsAndUser