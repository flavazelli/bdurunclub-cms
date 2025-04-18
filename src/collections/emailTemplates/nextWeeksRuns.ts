// emailTemplates/nextWeekRunsEmail.js

export function nextWeekRunsEmail(runs) {
  const runItems = runs
    .map(
      (run) => `
      <li style="margin-bottom: 12px;">
        <strong> ${run.title}</strong><br/>
        📍 <strong>Location:</strong> ${run.startingLocation}<br/>
        🕒 <strong>Time:</strong> ${new Date(run.eventTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Toronto',
        })}<br/>
        <a href="${process.env.CLIENT_URL}/events/${run.id}" style="color: #15803d; text-decoration: underline;">View Details</a>
      </li>
      `,
    )
    .join('')

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Next Week's Runs</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); padding: 32px;">
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <h1 style="color: #15803d; margin: 0; font-size: 26px;">Next Week's Runs Are Live! 🏃‍♂️</h1>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                    Hey Members,
                  </p>
                  <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                    Next week's runs are now available! Check out the schedule below and join the ones that suit your pace and vibe:
                  </p>
                  <ul style="padding-left: 20px; font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                    ${runItems}
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 16px;">
                  <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                    Don't forget to register early so we know who’s coming!
                  </p>
                  <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 4px;">
                    — The Baie D'Urfé Social Run Club Team
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`
}
