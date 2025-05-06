const confirmRegistration = function ({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventLink,
}: {
  firstName: string
  eventName: string
  eventDate: string
  eventLocation: string
  eventLink: string
}) {
  const facebookIcon = `${process.env.CLIENT_URL}/facebook-green.png`
  const telegramIcon = `${process.env.CLIENT_URL}/telegram-green.png`
  const instagramIcon = `${process.env.CLIENT_URL}/instagram-green.png`
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Event Registration Confirmation</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); padding: 32px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="color: #15803d; margin: 0; font-size: 28px;">You're Registered!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px;">
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  Hi ${firstName},
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                  Thanks for signing up for the <strong>${eventName}</strong> with the Baie D'Urfé Social Run Club! We're excited to have you with us.
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  Event Details:
                </p>
                <ul style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0 0 16px; padding: 0;">
                  <li><strong>Date & Time:</strong> ${eventDate}</li>
                  <li><strong>Location:</strong> ${eventLocation}</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px 0;">
                <a href="${eventLink}"
                   style="background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
                  View Event Details
                </a>
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
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export { confirmRegistration as default }
