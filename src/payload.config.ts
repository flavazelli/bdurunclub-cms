// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import type { PayloadRequest, TaskConfig, WorkflowConfig } from 'payload'
import { gcsStorage } from '@payloadcms/storage-gcs'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import * as Sentry from '@sentry/nextjs'

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
import verificationReminderTemplate from './collections/emailTemplates/verificationEmailReminder'
import axios from 'axios'

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
  cors: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:4173', 'https://test1.bdurunclub.com'],
  csrf: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:4173', 'https://test1.bdurunclub.com'],
  collections: [Users, Events, GPXFiles],
  editor: lexicalEditor(),
  email: nodemailerAdapter({
    defaultFromAddress: 'no-reply@bdurunclub.com',
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
          pagination: false,
        })

        //send telegram message to the channel
        await sendTelegramWeeklyUpdate(events.docs)

        //send email to all users
        for (const user of users.docs) {
          await req.payload.sendEmail({
            to: user.email,
            subject: 'New Runs Published for Next Week',
            html: nextWeekRunsEmail(events.docs),
          })
        }

        return new Response('ok', { status: 200 })
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
    {
      path: '/manage-unverified-users',
      method: 'get',
      handler: async (req) => {
        //called once a day
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return Response.json({ message: 'not authenticated' }, { status: 401 })
        }

        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        const startOfDayThreeDaysAgo = new Date(threeDaysAgo)
        startOfDayThreeDaysAgo.setHours(0, 0, 0, 0)

        const endOfDayThreeDaysAgo = new Date(threeDaysAgo)
        endOfDayThreeDaysAgo.setHours(23, 59, 59, 999)

        const unverifiedUsers = await req.payload.find({
          showHiddenFields: true,
          collection: 'users',
          where: {
            and: [
              {
                _verified: {
                  equals: false,
                },
              },
              {
                createdAt: {
                  greater_than_equal: startOfDayThreeDaysAgo.toISOString(),
                },
              },
              {
                createdAt: {
                  less_than_equal: endOfDayThreeDaysAgo.toISOString(),
                },
              },
            ],
          },
        })

        //send email to all unverified users
        for (const user of unverifiedUsers.docs) {
          console.log(user)
          await req.payload.sendEmail({
            to: user.email,
            subject: 'Account Verification Reminder',
            html: verificationReminderTemplate({
              user,
            }),
          })
        }

        //delete unverified users created a week ago
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const startOfDayOneWeekAgo = new Date(oneWeekAgo)

        console.log('Deleting unverified users created before:', startOfDayOneWeekAgo.toISOString())
        const response = await req.payload.delete({
          collection: 'users',
          where: {
            and: [
              {
                _verified: {
                  equals: false,
                },
              },
              {
                createdAt: {
                  less_than_equal: startOfDayOneWeekAgo.toISOString(),
                },
              },
            ],
          },
        })

        return Response.json({
          message: `${response.docs.length} unverified users deleted`,
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
    sentryPlugin({
      options: {
        captureErrors: [400, 403],
        debug: true,
      },
      Sentry,
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
