import type { CollectionConfig } from 'payload'

import { anyone } from './access/anyone'
import { authenticated } from './access/authenticated'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      access: {
        read: anyone
      }
    },
    {
      name: 'eventTime',
      type: 'date', 
      admin: {
        date: {
          pickerAppearance :'dayAndTime'
        }
      }, 
      access: {
        read: anyone
      }
    }, 
    {
      name: 'registeredUsers', 
      type: 'relationship',
      access: {
        update: ({ req: { user }, id, data, doc }) => { 
          return doc?.registeredUsers.includes(user?.id)
        },
        read: authenticated
      },
      relationTo: 'users', 
      hasMany: true,
    }, 
    {
      type: "richText", 
      name: "mapLink",
      access: {
        read: authenticated
      }
    }
  ],
}
