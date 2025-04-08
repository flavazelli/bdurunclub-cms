// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp, { queue } from 'sharp'

import { Users } from './collections/Users'
import { GPXFiles } from './collections/GPXFiles'
import { Events } from './collections/Events'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { TaskConfig as BaseTaskConfig, WorkflowConfig } from 'payload'

import confirmRegistration from './collections/emailTemplates/confirmRegistration'
import sendHourReminder from './collections/emailTemplates/sendHourReminder'
import { v4 as uuidv4 } from 'uuid';


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    }
  },
  collections: [Users, Events, GPXFiles],
  editor: lexicalEditor(),
  email: nodemailerAdapter({
    defaultFromAddress: 'info@bdurun.club',
    defaultFromName: 'Info BDurun',
    // Nodemailer transportOptions
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  cors: ['http://localhost:8100', 'http://localhost:5173', 'http://localhost:4173'], 
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
        handler: async ({ input, req }) => {
          const user = await req.payload.findByID({
            collection: 'users',
            id: input.userId,
          });

          const event = await req.payload.findByID({
            collection: 'events',
            id: input.eventId,
          });

          const eventDate = new Date(event.eventTime).toLocaleString('en-US', {
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
              firstName: user.firstName,
              eventName: event.title,
              eventDate,
              eventLocation: event.startingLocation,
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
          shouldRestore: false
        },
        handler: async ({ input, req }) => {
          const now = new Date();
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          // Find all events starting an hour from now
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
                })
           }
          }

          return {
            output: {
              success: true
            },
          }
        },
      } as unknown as TaskConfig<'sendReminderOneHourBeforeEventStart'>, 
      {
        slug: 'publishNextWeeksRuns',
        retries: {
          shouldRestore: false
        },
        queue: 'thursdaysat7pm', 
        handler: async ({ input, req }) => {
          const now = new Date();
          const nextMonday = new Date(now);
          nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)); // Next Monday
          nextMonday.setHours(0, 0, 0, 0);

          const nextSunday = new Date(nextMonday);
          nextSunday.setDate(nextMonday.getDate() + 6); // Following Sunday
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

          // Publish the events as needed
          for (const event of events.docs) {
            // Logic to publish the event
            await req.payload.update({
              collection: 'events',
              id: event.id,
              data: {
                published: true,
              },
            });
          }
          //TODO: Send an email to the admin or relevant user

          return {
            output: {
              success: true
            },
          }
        },
      } as unknown as TaskConfig<'publishNextWeeksRuns'>
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

          // This workflow first runs a task called `createPost`.

          // You need to define a unique ID for this task invocation
          // that will always be the same if this workflow fails
          // and is re-executed in the future. Here, we hard-code it to '1'
            await tasks.sendConfirmationEmail(uuidv4(), {
              input: {
              userId: job.input.userId,
              eventId: job.input.eventId,
              },
            });

        },
      } as WorkflowConfig<'sendEmailToConfirmRun'>
    ],
    autoRun: [
      {
        cron: '0 * * * *', // every hour at minute 0
        limit: 100, // limit jobs to process each run
      },
      {
        cron: '*/30 * * * *', // every half hour
        limit: 100, 
        queue: 'everyHalfHour'
      }, 
      {
        cron: '0 19 * * 4', // every Thursday at 7pm
        queue: 'thursdaysat7pm',
      }, 
      // add as many cron jobs as you want
    ],
    shouldAutoRun: async (payload) => {
      // Tell Payload if it should run jobs or not.
      // This function will be invoked each time Payload goes to pick up and run jobs.
      // If this function ever returns false, the cron schedule will be stopped.
      return true
    },
  }, 
  onInit: async (payload) => {
    // Schedule the `sendReminderOneHourBeforeEventStart` task to run immediately on initialization
    await payload.jobs.queue({
      task: 'sendReminderOneHourBeforeEventStart',
      input: {}, // No specific input is required for this task
    });
    await payload.jobs.queue({
      task: 'publishNextWeeksRuns',
      input: {}, // No specific input is required for this task
    });
  },
})
