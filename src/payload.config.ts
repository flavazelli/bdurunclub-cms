// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import type { PayloadRequest, TaskConfig, WorkflowConfig } from 'payload'
import { gcsStorage } from '@payloadcms/storage-gcs'

import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp, { queue } from 'sharp'

import { Users } from './collections/Users'
import { GPXFiles } from './collections/GPXFiles'
import { Events } from './collections/Events'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import confirmRegistration from './collections/emailTemplates/confirmRegistration'
import sendHourReminder from './collections/emailTemplates/sendHourReminder'
import { v4 as uuidv4 } from 'uuid'
import { nextWeekRunsEmail } from './collections/emailTemplates/nextWeeksRuns'
import { sendTelegramWeeklyUpdate } from '@/integrations/telegram/sendTelegramWeeklyUpdate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: 'America/Toronto',
    },
  },
  serverURL: process.env.SERVER_URL || 'http://localhost:3000',
  cors: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:4173'],
  csrf: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:4173'],
  collections: [Users, Events, GPXFiles],
  editor: lexicalEditor(),
  email: nodemailerAdapter({
    defaultFromAddress: 'MS_1PD4AI@test-xkjn41m2yk54z781.mlsender.net',
    defaultFromName: '🏃 BDURunClub',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  endpoints: [
    {
      path: '/publish-next-weeks-runs',
      method: 'get',
      handler: async (req) => {
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 })
        }

        const now = new Date()
        const nextMonday = new Date(now)
        nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7))
        nextMonday.setHours(0, 0, 0, 0)

        const nextSunday = new Date(nextMonday)
        nextSunday.setDate(nextMonday.getDate() + 6)
        nextSunday.setHours(23, 59, 59, 999)

        const events = await req.payload.find({
          collection: 'events',
          where: {
            and: [
              {
                eventTime: {
                  greater_than_equal: nextMonday.toISOString(),
                },
              },
              {
                eventTime: {
                  less_than_equal: nextSunday.toISOString(),
                },
              },
              {
                visible: {
                  equals: false,
                },
              },
            ],
          },
        })

        console.log('Events to publish:', events.docs)
        // If there are no events to publish, return early

        if (events.totalDocs === 0) {
          return new Response('ok', { status: 200 })
        }

        //publish the events
        await req.payload.update({
          collection: 'events',
          where: {
            and: [
              {
                eventTime: {
                  greater_than_equal: nextMonday.toISOString(),
                },
              },
              {
                eventTime: {
                  less_than_equal: nextSunday.toISOString(),
                },
              },
              {
                visible: {
                  equals: false,
                },
              },
            ],
          },
          data: {
            visible: true,
          },
        })

        const users = await req.payload.find({
          collection: 'users',
        })

        //send telegram message to the channel
        await sendTelegramWeeklyUpdate(events.docs)
        //send email to all users
        await req.payload.sendEmail({
          bcc: users.docs.map((user) => user.email).join(','),
          subject: 'New Runs Published for Next Week',
          html: nextWeekRunsEmail(events.docs),
        })
      },
    },
    {
      path: '/send-hour-reminder',
      method: 'get',
      handler: async (req) => {
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return Response.json({ message: 'not authenticated' }, { status: 401 })
        }

        const now = new Date()
        const closestQuarterHour = new Date(now)
        closestQuarterHour.setMinutes(Math.floor(closestQuarterHour.getMinutes() / 15) * 15, 0, 0)
        const closestQuarterHourOneHourLater = new Date(closestQuarterHour)
        closestQuarterHourOneHourLater.setHours(closestQuarterHourOneHourLater.getHours() + 1)

        const closestQuarterHourOneHourLaterAddMinute = new Date(closestQuarterHourOneHourLater)
        closestQuarterHourOneHourLaterAddMinute.setMinutes(
          closestQuarterHourOneHourLaterAddMinute.getMinutes() + 1,
        )
        console.log(
          'Closest quarter hour + 1 hour:',
          closestQuarterHourOneHourLater.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Toronto',
          }),
        )
        console.log(
          'Closest quarter hour + 1 hour + 1 minute:',
          closestQuarterHourOneHourLaterAddMinute.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Toronto',
          }),
        )

        const events = await req.payload.find({
          collection: 'events',
          where: {
            and: [
              {
                eventTime: {
                  greater_than_equal: closestQuarterHourOneHourLater.toISOString(),
                },
              },
              {
                eventTime: {
                  less_than: closestQuarterHourOneHourLaterAddMinute.toISOString(),
                },
              },
            ],
          },
        })

        console.log('Events to send reminder for:', events.docs)

        for (const event of events.docs) {
          for (const user of event.registeredUsers) {
            await req.payload.sendEmail({
              to: user.email,
              subject: `${event.title} starts in an hour!`,
              html: sendHourReminder({
                firstName: user.firstName,
                eventTitle: event.title,
                eventTime: event.eventTime,
                startLocation: event.startingLocation,
                eventLink: `${process.env.CLIENT_URL}/events/${event.id}`,
              }),
            })
          }
        }

        return Response.json({
          message: 'Emails sent successfully',
        })
      },
    },
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      dbName: process.env.DATABASE_NAME || 'bdurunclub',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    gcsStorage({
      collections: {
        'gpx-files': true,
      },
      bucket: process.env.GCS_BUCKET,
      options: {
        projectId: process.env.GCS_PROJECT_ID,
      },
      enabled: process.env.NODE_ENV === 'production',
    }),
  ],
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [
      {
        retries: 5,
        slug: 'sendConfirmationEmail',
        inputSchema: [
          {
            name: 'userId',
            type: 'text',
            required: true,
          },
          {
            name: 'eventId',
            type: 'text',
            required: true,
          },
        ],
        outputSchema: [
          {
            name: 'success',
            type: 'boolean',
          },
        ],
        handler: async ({
          input,
          req,
        }: {
          input: { userId: string; eventId: string }
          req: PayloadRequest
        }) => {
          const user = await req.payload.findByID({
            collection: 'users',
            id: input.userId,
          })

          const event = await req.payload.findByID({
            collection: 'events',
            id: input.eventId,
          })

          const eventDate = new Date(event.eventTime ?? '').toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Toronto',
          })

          const url = `${process.env.CLIENT_URL}/events/${event.id}`

          await req.payload.sendEmail({
            to: user.email,
            subject: 'Run Registration Confirmation',
            html: confirmRegistration({
              firstName: user.firstName ?? 'User',
              eventName: event.title ?? 'Unknown Event',
              eventDate,
              eventLocation: event.startingLocation ?? 'Location not specified',
              eventLink: url,
            }),
          })

          return {
            output: {
              success: true,
            },
          }
        },
      } as unknown as TaskConfig<'sendConfirmationEmail'>,
    ],
    workflows: [
      {
        slug: 'sendEmailToConfirmRun',
        inputSchema: [
          {
            name: 'userId',
            type: 'text',
            required: true,
          },
          {
            name: 'eventId',
            type: 'text',
            required: true,
          },
        ],
        handler: async ({ job, tasks }) => {
          await tasks.sendConfirmationEmail(uuidv4(), {
            input: {
              userId: job.input.userId,
              eventId: job.input.eventId,
            },
          })
        },
      } as WorkflowConfig<'sendEmailToConfirmRun'>,
    ],
    autoRun: [
      {
        cron: '0 * * * *',
        limit: 100,
      },
      {
        cron: '*/15 * * * *',
        limit: 100,
        queue: 'every15Mins',
      },
      {
        cron: '0 * * * *',
        queue: 'thursdaysat7pm',
      },
    ],
    shouldAutoRun: async () => {
      return process.env.NODE_ENV === 'development'
    },
  },
})
