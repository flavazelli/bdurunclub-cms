const sendHourReminder = ({
  firstName,
  eventTitle,
  startLocation,
  eventTime,
  eventLink,
}: {
  firstName: string
  eventTitle: string
  startLocation: string
  v: string
  eventLink: string
}) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Run Reminder</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); padding: 32px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="color: #15803d; margin: 0; font-size: 26px;">Your Run Starts Soon!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px;">
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  Hey ${firstName},
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                  Just a friendly reminder that <strong>${eventTitle}</strong> kicks off in an hour!
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  📍 <strong>Location:</strong> ${startLocation}<br/>
                  🕒 <strong>Time:</strong> ${eventTime}
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                  Please try to arrive 10–15 minutes early to stretch and get a light warmup in with the group. If you're unable to attend, kindly unregister so we know who's coming.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 8px;">
                <a href="${eventLink}"
                   style="font-size: 14px; color: #ef4444; text-decoration: underline;">
                  Can't make it? Unregister here
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px;">
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                  See you there! 🏃‍♀️💨
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

export default sendHourReminder
