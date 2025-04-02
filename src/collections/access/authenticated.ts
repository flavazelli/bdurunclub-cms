import { Access } from 'payload'

export const authenticated: Access = ({ req: { user } }) => Boolean(user)