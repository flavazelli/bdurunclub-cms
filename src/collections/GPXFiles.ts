import type { CollectionConfig } from 'payload'

export const GPXFiles: CollectionConfig = {
  slug: 'gpx-files',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['application/octet-stream'],
  },
  hooks: {
    afterRead: [
      ({ doc, res }) => {
        if (res && doc?.filename) {
          res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`)
        }
      },
    ],
  },
}
