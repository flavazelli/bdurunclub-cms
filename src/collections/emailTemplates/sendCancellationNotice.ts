const sendCancellationNotice = ({
  firstName,
  eventTitle,
  eventTime,
  cancelReason,
}: {
  firstName: string
  eventTitle: string
  eventTime: string
  cancelReason: string
}) => {
  const humanReadableTime = new Date(eventTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Toronto',
  })

  const facebookIcon = `${process.env.CLIENT_URL}/facebook-green.png`
  const telegramIcon = `${process.env.CLIENT_URL}/telegram-green.png`
  const instagramIcon = `${process.env.CLIENT_URL}/instagram-green.png`
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Run Cancelled</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); padding: 32px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="color: #dc2626; margin: 0; font-size: 26px;">Today's Run is Cancelled</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px;">
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  Hey ${firstName},
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                  This is to inform you that <strong>${eventTitle} starting at ${humanReadableTime}</strong> has been cancelled.
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 16px 0;">
                  <strong>Reason for cancellation:</strong> ${cancelReason}
                </p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                  We apologize for the inconvenience and hope to see you at our next run!
                </p>
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

export default sendCancellationNotice
