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
    const facebookIcon = `${process.env.CLIENT_URL}/facebook-green.png`
    const telegramIcon = `${process.env.CLIENT_URL}/telegram-green.png`
    const instagramIcon = `${process.env.CLIENT_URL}/instagram-green.png`

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
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; padding: 20px 0; font-size: 14px; color: #6b7280; font-family: sans-serif;">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; display: inline-block;">
                         <tr>
                          <td style="padding: 0 10px;">
                            <a href="https://www.facebook.com/groups/1336190874163065" target="_blank" style="text-decoration: none;">
                             <img src="${facebookIcon}" />
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://t.me/+7lvEwYCKk_JhZDQx" target="_blank" style="text-decoration: none;">
                              <img src="${telegramIcon}">
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://www.instagram.com/bdurunclub" target="_blank" style="text-decoration: none;">
                              <img src="${instagramIcon}">
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                        &copy; Baie D'Urfé Social Run Club. All rights reserved.
                      </div>
                    </td>
                  </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`
}
