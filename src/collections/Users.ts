import type { CollectionConfig } from 'payload'

import { admins } from './access/admins'
import adminsAndUser from './access/adminsAndUser'
import { anyone } from './access/anyone'
import { checkRole } from './access/checkRole'
import { authenticated } from './access/authenticated'
import { protectRoles } from './hooks/protectRoles'
import verifyEmailTemplate from './emailTemplates/verifyEmail'
import { headersWithCors } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 28800, // 8 hours
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN,
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    },
    verify: {
      generateEmailHTML: ({ token }) => verifyEmailTemplate({ token }),
    },
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: authenticated,
    create: anyone,
    update: adminsAndUser,
    delete: adminsAndUser,
    admin: ({ req: { user } }) => checkRole(['admin'], user),
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      hooks: {
        beforeChange: [protectRoles],
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Member',
          value: 'member',
        },
      ],
      defaultValue: 'member',
      access: {
        read: admins,
      },
    },
    {
      name: 'level',
      type: 'select',
      hasMany: false,
      options: [
        {
          label: 'Beginner',
          value: 'beginner',
        },
        {
          label: 'Intermediate',
          value: 'intermediate',
        },
        {
          label: 'Advanced',
          value: 'advanced',
        },
      ],
      access: {
        read: authenticated,
      },
    },
    {
      name: 'bduResident',
      type: 'checkbox',
      access: {
        read: adminsAndUser,
      },
    },
    {
      name: 'pace',
      type: 'select',
      options: Array.from({ length: 25 }, (_, i) => {
        const minutes = 4 + Math.floor((i * 10) / 60)
        const seconds = (i * 10) % 60
        const time = `${minutes}:${seconds.toString().padStart(2, '0')}`
        return {
          label: time,
          value: time,
        }
      }),
      access: {
        read: adminsAndUser,
      },
    },
  ],
  endpoints: [
    {
      path: '/me/upcoming-events',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json(
            {
              message: 'not authenticated',
            },
            {
              status: 401,
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
          )
        }
        const { user } = req
        const { payload } = req
        const events = await payload.find({
          collection: 'events',
          where: {
            and: [
              {
                registeredUsers: {
                  equals: user.id,
                },
              },
              {
                eventTime: {
                  greater_than: new Date(),
                },
              },
              {
                visible: {
                  equals: true,
                },
              },
            ],
          },
          depth: 0,
          sort: 'eventTime',
        })
        return Response.json(events, {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          }),
        })
      },
    },
  ],

  hooks: {
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation === 'create') {
          await req.payload.sendEmail({
            to: 'francis.lavazelli@gmail.com',
            subject: 'New Member Joined!',
            html: `
              <p>A new member has been joined:</p>
              <ul>
                <li><strong>Id:</strong> ${doc.id}</li>
                <li><strong>Name:</strong> ${doc.firstName} ${doc.lastName}</li>
              </ul>
            `,
          })
        }
      },
    ],
  },
}
