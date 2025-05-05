import { Access } from 'payload'

export const authenticatedOrPublic: Access = ({ req: { user } }) => {
  return Boolean(user) || {
    public: {
      equals:true
    }
  }
}
