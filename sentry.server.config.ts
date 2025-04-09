// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://67355fbcff4cc334db8f64fbe7a673d7@o4509123224797184.ingest.us.sentry.io/4509123227746304',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
