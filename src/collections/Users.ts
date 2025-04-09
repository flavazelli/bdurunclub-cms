import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'

import { admins } from './access/admins'
import adminsAndUser from './access/adminsAndUser'
import { anyone } from './access/anyone'
import { checkRole } from './access/checkRole'
import { authenticated } from './access/authenticated'
import { protectRoles } from './hooks/protectRoles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 28800, // 8 hours
    cookies: {
      secure: true,
      domain: process.env.COOKIE_DOMAIN,
    },
    verify: {
      generateEmailHTML: ({ token }) => {
        // Use the token provided to allow your user to verify their account
        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`
        const year = new Date().getFullYear()
        return `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <title>Verify Your Email</title>
              </head>
              <body style="margin:0; padding:0; background-color:#f0fdf4; font-family: Arial, sans-serif; color: #1f2937;">
                <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color: #f0fdf4;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding: 40px; text-align: center;">
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <h1 style="color:#047857; font-size:28px; margin: 0;">Baie D'Urfé Social Run Club</h1>
                            <p style="color:#4b5563; font-size:16px; margin: 10px 0 0;">Let's get you up and running 🚀</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 0;">
                            <h2 style="color:#111827; font-size:22px; margin: 0 0 20px;">Verify Your Email Address</h2>
                            <p style="color:#4b5563; font-size:16px; margin: 0 0 30px;">
                              Thanks for signing up! Please confirm your email address by clicking the button below.
                            </p>
                            <a href="${url}" style="background-color:#047857; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block;">
                              Verify Email
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 30px;">
                            <p style="color:#6b7280; font-size:14px; margin: 0 0 10px;">
                              If you did not create an account, no further action is required.
                            </p>
                            <p style="color:#9ca3af; font-size:12px; margin: 0;">
                              &copy; ${year}  Baie D'Urfé Social Run Club. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body> 
            </html>`
      },
    }
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: authenticated,
    create: anyone,
    update: adminsAndUser,
    delete: admins,
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
      access: {
        read: admins,
      },
    }
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
            registeredUsers: {
              equals: user.id,
            },
            eventTime: {
              greater_than: new Date(),
            },
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
        console.log(doc)
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

    // ...
  },
}
