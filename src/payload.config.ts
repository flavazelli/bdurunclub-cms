// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { GPXFiles } from './collections/GPXFiles'
import { Events } from './collections/Events'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { PayloadRequest, TaskConfig, WorkflowConfig } from 'payload'

import confirmRegistration from './collections/emailTemplates/confirmRegistration'
import sendHourReminder from './collections/emailTemplates/sendHourReminder'
import { v4 as uuidv4 } from 'uuid'
import { gcsStorage } from '@payloadcms/storage-gcs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  serverURL: process.env.SERVER_URL || 'http://localhost:3000',
  cors: [process.env.CLIENT_URL || 'http://localhost:3000'],
  collections: [Users, Events, GPXFiles],
  editor: lexicalEditor(),
  email: nodemailerAdapter({
    defaultFromAddress: 'MS_1PD4AI@test-xkjn41m2yk54z781.mlsender.net',
    defaultFromName: 'Info BDurun',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    skipVerify: true,
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      dbName: process.env.DATABASE_NAME || 'bdurunclub',
    }}),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    ...(process.env.ENV === 'production'
      ? [
          gcsStorage({
            collections: {
              'gpx-files': true,
            },
            bucket: process.env.GCS_BUCKET,
            options: {
              apiEndpoint: process.env.GCS_ENDPOINT,
              projectId: process.env.GCS_PROJECT_ID,
            },
          }),
        ]
      : []),
  ],
  jobs: {
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
        handler: async ({ input, req }: { input: { userId: string; eventId: string }; req: PayloadRequest }) => {
          const user = await req.payload.findByID({
            collection: 'users',
            id: input.userId,
          });

          const event = await req.payload.findByID({
            collection: 'events',
            id: input.eventId,
          });

          const eventDate = new Date(event.eventTime ?? '').toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const url = `${process.env.CLIENT_URL}/events/${event.id}`;

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
          });

          return {
            output: {
              success: true,
            },
          };
        },
      } as unknown as TaskConfig<'sendConfirmationEmail'>,
      {
        slug: 'sendReminderOneHourBeforeEventStart',
        retries: {
          shouldRestore: false,
        },
        handler: async ({ req }: { req: PayloadRequest }) => {
          const now = new Date();
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

          const events = await req.payload.find({
            collection: 'events',
            where: {
              and: [
                {
                  eventTime: {
                    greater_than_equal: now.toISOString(),
                  },
                },
                {
                  eventTime: {
                    less_than: oneHourFromNow.toISOString(),
                  },
                },
              ],
            },
          });

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
              });
            }
          }

          return {
            output: {
              success: true,
            },
          };
        },
      } as unknown as TaskConfig<'sendReminderOneHourBeforeEventStart'>,
      {
        slug: 'publishNextWeeksRuns',
        retries: {
          shouldRestore: false,
        },
        queue: 'thursdaysat7pm',
        handler: async ({ req }: { req: PayloadRequest }) => {
          const now = new Date();
          const nextMonday = new Date(now);
          nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
          nextMonday.setHours(0, 0, 0, 0);

          const nextSunday = new Date(nextMonday);
          nextSunday.setDate(nextMonday.getDate() + 6);
          nextSunday.setHours(23, 59, 59, 999);

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
              ],
            },
          });

          for (const event of events.docs) {
            // Logic to publish the event
          }

          return {
            output: {
              success: true,
            },
          };
        },
      } as unknown as TaskConfig<'publishNextWeeksRuns'>,
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
          });
        },
      } as WorkflowConfig<'sendEmailToConfirmRun'>,
    ],
    autoRun: [
      {
        cron: '0 * * * *',
        limit: 100,
      },
      {
        cron: '*/30 * * * *',
        limit: 100,
        queue: 'everyHalfHour',
      },
      {
        cron: '0 19 * * 4',
        queue: 'thursdaysat7pm',
      },
    ],
    shouldAutoRun: async () => {
      return true;
    },
  },
  onInit: async (payload) => {
    await payload.jobs.queue({
      task: 'sendReminderOneHourBeforeEventStart',
      input: {},
    });
    await payload.jobs.queue({
      task: 'publishNextWeeksRuns',
      input: {},
    });
  },
});
