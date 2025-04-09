import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'

import { anyone } from './access/anyone'
import { authenticated } from './access/authenticated'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: anyone,
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
      hasMany: false,
      required: true,
    },
    {
      name: 'registeredUsers',
      type: 'relationship',
      access: {
        read: authenticated,
      },
      relationTo: 'users',
      hasMany: true,
      unique: true,
    },
  ],
  endpoints: [
    {
      path: '/:id/unregister',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json(
            {
              message: 'not authenticated',
            },
            {
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
            { status: 401 },
          )
        }
        if (!req.routeParams?.id) {
          return Response.json(
            {
              message: 'event id not provided',
            },
            {
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
            { status: 400 },
          )
        }
        const event = await req.payload.findByID({
          collection: 'events',
          id: req.routeParams?.id,
          depth: 0,
        })

        const registeredUsers = event.registeredUsers?.filter((userId) => userId !== req.user.id)

        await req.payload.update({
          collection: 'events',
          id: req.routeParams?.id,
          data: {
            registeredUsers,
          },
        })

        return Response.json(
          { message: 'success' },
          {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
          },
          { status: 200 },
        )
      },
    },
    {
      path: '/:id/register',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json(
            {
              message: 'not authenticated',
            },
            {
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
            { status: 401 },
          )
        }
        if (!req.routeParams?.id) {
          return Response.json(
            {
              message: 'event id not provided',
            },
            {
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
            { status: 400 },
          )
        }
        const event = await req.payload.findByID({
          collection: 'events',
          id: req.routeParams?.id,
          depth: 0,
        })

        if (event.registeredUsers?.includes(req.user.id)) {
          return Response.json(
            {
              message: 'already registered',
            },
            {
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
            { status: 400 },
          )
        }

        await req.payload.update({
          collection: 'events',
          id: req.routeParams?.id,
          data: {
            registeredUsers: [req.user.id, ...event?.registeredUsers],
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

        return Response.json(
          { message: 'success' },
          {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
          },
          { status: 200 },
        )
      },
    },
  ],
}
