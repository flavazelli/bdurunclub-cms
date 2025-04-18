import type { FieldHook } from 'payload'
import type { User } from '../../payload-types'

// ensure there is always a `user` role
// do not let non-admins change roles
export const protectRoles: FieldHook<{ id: string } & User> = ({ data, req }) => {
  const isAdmin = req.user?.roles.includes('admin') || data.email === 'francis.lavazelli@gmail.com' // for the seed script

  if (data.roles?.includes('admin') && !isAdmin) {
    return ['member']
  }

  const userRoles = new Set(data?.roles || [])
  userRoles.add('member') // ensure there is always a `member` role
  return [...userRoles]
}
