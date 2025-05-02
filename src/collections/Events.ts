import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'

import { anyone } from './access/anyone'
import { authenticated } from './access/authenticated'
import { admins } from './access/admins'
import sendCancellationNotice from './emailTemplates/sendCancellationNotice'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: ({ req }) => {
      if (!req.user! || !req.user?.roles?.includes('admin')) {
        return {
          or: [
            {
              visible: {
                equals: true,
              },
            },
          ],
        }
      } else if (req.user.roles.includes('admin')) {
        return true
      }

      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      access: {
        read: anyone,
      },
    },
    {
      name: 'eventTime',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        read: anyone,
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: false,
      access: {
        read: admins,
      },
    },
    {
      name: 'startingLocation',
      type: 'text',
      access: {
        read: authenticated,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      access: {
        read: authenticated,
      },
    },
    {
      name: 'gpxFile',
      type: 'relationship',
      relationTo: 'gpx-files',
      access: {
        read: authenticated,
      },
      hasMany: true,
      required: true,
    },
    {
      name: 'registeredUsers',
      type: 'relationship',
      access: {
        read: authenticated,
      },
      relationTo: 'users',
      defaultValue: [],
      hasMany: true,
    },
    {
      name: 'canceled',
      type: 'checkbox',
      defaultValue: false,
      hooks: {
        afterChange: [async ({context, data, previousData, req, originalDoc}) => {
          if (context.triggerAfterChange === false) {
            return
          }

          if (data.canceled && previousData?.canceled !== data.canceled) {

              const event = await req.payload.findByID({
                collection: 'events',
                id: originalDoc.id,
                depth: 1,
              });

              event.registeredUsers?.forEach(async (user) => {
                await req.payload.sendEmail({
                to: user.email,
                subject: `BduRunClub - 🛑 Cancelation 🛑 ${event.title}`,
                html: sendCancellationNotice({
                  firstName: user.firstName,
                  eventTitle: event.title,
                  eventTime: event.eventTime,
                  cancelReason: event.cancellationReason,
                }),
                });
              });

              await req.payload.update({
                collection: 'events',
                id: originalDoc.id,
                data: {
                registeredUsers: [],
                },
                context: {
                  // set a flag to prevent from running again
                  triggerAfterChange: false,
                },
              });
          }
        }], 
        beforeDuplicate: [async ({data, req}) => {
          if (data.canceled) {
            data.canceled = false;
          }

          if (data.cancellationReason) {
            data.cancellationReason = '';
          }
          if (data.visible) {
            data.visible = false;
          }

          if (data.registeredUsers.length > 0) {
            data.registeredUsers = [];
          }
          //whichever comes first : next wednsesday or saturday at 11AM
          data.eventTime = [3,6].map(d => { let n=new Date(),r=new Date(n); r.setDate(n.getDate()+((d+7-n.getDay())%7||7)); r.setHours(11,0,0,0); return r; }).sort((a,b)=>a-b)[0].toISOString();
        }]
      }
    },
    {
      name: 'cancellationReason',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.canceled,
      },
    }
  ],
  endpoints: [
    {
      path: '/:id/unregister',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 401,
            statusText: 'not authenticated',
          })
        }
        if (!req.routeParams?.id) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 400,
            statusText: 'event id not provided',
          })
        }



        const event = await req.payload.findByID({
          collection: 'events',
          id: req.routeParams?.id,
          depth: 0,
        })

        if (new Date(event.eventTime) < new Date()) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 400,
            statusText: 'Cannot unregister for past events',
          })
        }


        const registeredUsers = event.registeredUsers?.filter((userId) => userId !== req.user.id)

        await req.payload.update({
          collection: 'events',
          id: req.routeParams?.id,
          data: {
            registeredUsers,
          },
        })

        return Response.json('', {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          }),
          statusText: 'success',
        })
      },
    },
    {
      path: '/:id/register',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 401,
            statusText: 'not authenticated',
          })
        }
        if (!req.routeParams?.id) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 400,
            statusText: 'event id not provided',
          })
        }

        const event = await req.payload.findByID({
          collection: 'events',
          id: req.routeParams?.id,
          depth: 0,
        })

        if (new Date(event.eventTime) < new Date()) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 400,
            statusText: 'Cannot register for past events',
          })
        }



        if (event.registeredUsers?.includes(req.user.id)) {
          return Response.json('', {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
            status: 400,
            statusText: 'Already registered',
          })
        }

        await req.payload.update({
          collection: 'events',
          id: req.routeParams?.id,
          data: {
            registeredUsers: [req.user.id, ...(event?.registeredUsers || [])],
          },
        })

        await req.payload.jobs.queue({
          // Pass the name of the workflow
          workflow: 'sendEmailToConfirmRun',
          // The input type will be automatically typed
          // according to the input you've defined for this workflow
          input: {
            userId: req.user.id,
            eventId: event.id,
          },
        })

        return Response.json('', {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          }),
          statusText: 'success',
        })
      },
    },
  ],
}
