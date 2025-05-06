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
  eventTime: string
  eventLink: string
}) => {
  const humanReadableTime = new Date(eventTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Toronto',
  })
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
                  🕒 <strong>Time:</strong> ${humanReadableTime}
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
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align: center; padding: 20px 0; font-size: 14px; color: #6b7280; font-family: sans-serif;">
                    <tr>
                          <td style="padding: 0 10px;">
                            <a href="https://www.facebook.com/groups/1336190874163065" target="_blank" style="text-decoration: none;">
                             <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktZmFjZWJvb2siIHZpZXdCb3g9IjAgMCAxNiAxNiI+CiAgPHBhdGggZD0iTTE2IDguMDQ5YzAtNC40NDYtMy41ODItOC4wNS04LTguMDVDMy41OCAwLS4wMDIgMy42MDMtLjAwMiA4LjA1YzAgNC4wMTcgMi45MjYgNy4zNDcgNi43NSA3Ljk1MXYtNS42MjVoLTIuMDNWOC4wNUg2Ljc1VjYuMjc1YzAtMi4wMTcgMS4xOTUtMy4xMzEgMy4wMjItMy4xMzEuODc2IDAgMS43OTEuMTU3IDEuNzkxLjE1N3YxLjk4aC0xLjAwOWMtLjk5MyAwLTEuMzAzLjYyMS0xLjMwMyAxLjI1OHYxLjUxaDIuMjE4bC0uMzU0IDIuMzI2SDkuMjVWMTZjMy44MjQtLjYwNCA2Ljc1LTMuOTM0IDYuNzUtNy45NTEiLz4KPC9zdmc+" alt="Facebook" width="20" height="20" style="vertical-align: middle;" />
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://t.me/+7lvEwYCKk_JhZDQx" target="_blank" style="text-decoration: none;">
                              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktdGVsZWdyYW0iIHZpZXdCb3g9IjAgMCAxNiAxNiI+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAxIDAgOGE4IDggMCAwIDEgMTYgME04LjI4NyA1LjkwNnEtMS4xNjguNDg2LTQuNjY2IDIuMDEtLjU2Ny4yMjUtLjU5NS40NDJjLS4wMy4yNDMuMjc1LjMzOS42OS40N2wuMTc1LjA1NWMuNDA4LjEzMy45NTguMjg4IDEuMjQzLjI5NHEuMzkuMDEuODY4LS4zMiAzLjI2OS0yLjIwNiAzLjM3NC0yLjIzYy4wNS0uMDEyLjEyLS4wMjYuMTY2LjAxNnMuMDQyLjEyLjAzNy4xNDFjLS4wMy4xMjktMS4yMjcgMS4yNDEtMS44NDYgMS44MTctLjE5My4xOC0uMzMuMzA3LS4zNTguMzM2YTggOCAwIDAgMS0uMTg4LjE4NmMtLjM4LjM2Ni0uNjY0LjY0LjAxNSAxLjA4OC4zMjcuMjE2LjU4OS4zOTMuODUuNTcxLjI4NC4xOTQuNTY4LjM4Ny45MzYuNjI5cS4xNC4wOTIuMjcuMTg3Yy4zMzEuMjM2LjYzLjQ0OC45OTcuNDE0LjIxNC0uMDIuNDM1LS4yMi41NDctLjgyLjI2NS0xLjQxNy43ODYtNC40ODYuOTA2LTUuNzUxYTEuNCAxLjQgMCAwIDAtLjAxMy0uMzE1LjM0LjM0IDAgMCAwLS4xMTQtLjIxNy41My41MyAwIDAgMC0uMzEtLjA5M2MtLjMuMDA1LS43NjMuMTY2LTIuOTg0IDEuMDkiLz4KPC9zdmc+" alt="Telegram Icon" width="16" height="16" style="vertical-align:middle;">
                            </a>
                          </td>
                          <td style="padding: 0 10px;">
                            <a href="https://www.instagram.com/bdurunclub" target="_blank" style="text-decoration: none;">
                              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktaW5zdGFncmFtIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgogIDxwYXRoIGQ9Ik04IDBDNS44MjkgMCA1LjU1Ni4wMSA0LjcwMy4wNDggMy44NS4wODggMy4yNjkuMjIyIDIuNzYuNDJhMy45IDMuOSAwIDAgMC0xLjQxNy45MjNBMy45IDMuOSAwIDAgMCAuNDIgMi43NkMuMjIyIDMuMjY4LjA4NyAzLjg1LjA0OCA0LjcuMDEgNS41NTUgMCA1LjgyNyAwIDguMDAxYzAgMi4xNzIuMDEgMi40NDQuMDQ4IDMuMjk3LjA0Ljg1Mi4xNzQgMS40MzMuMzcyIDEuOTQyLjIwNS41MjYuNDc4Ljk3Mi45MjMgMS40MTcuNDQ0LjQ0NS44OS43MTkgMS40MTYuOTIzLjUxLjE5OCAxLjA5LjMzMyAxLjk0Mi4zNzJDNS41NTUgMTUuOTkgNS44MjcgMTYgOCAxNnMyLjQ0NC0uMDEgMy4yOTgtLjA0OGMuODUxLS4wNCAxLjQzNC0uMTc0IDEuOTQzLS4zNzJhMy45IDMuOSAwIDAgMCAxLjQxNi0uOTIzYy40NDUtLjQ0NS43MTgtLjg5MS45MjMtMS40MTcuMTk3LS41MDkuMzMyLTEuMDkuMzcyLTEuOTQyQzE1Ljk5IDEwLjQ0NSAxNiAxMC4xNzMgMTYgOHMtLjAxLTIuNDQ1LS4wNDgtMy4yOTljLS4wNC0uODUxLS4xNzUtMS40MzMtLjM3Mi0xLjk0MWEzLjkgMy45IDAgMCAwLS45MjMtMS40MTdBMy45IDMuOSAwIDAgMCAxMy4yNC40MmMtLjUxLS4xOTgtMS4wOTItLjMzMy0xLjk0My0uMzcyQzEwLjQ0My4wMSAxMC4xNzIgMCA3Ljk5OCAwem0tLjcxNyAxLjQ0MmguNzE4YzIuMTM2IDAgMi4zODkuMDA3IDMuMjMyLjA0Ni43OC4wMzUgMS4yMDQuMTY2IDEuNDg2LjI3NS4zNzMuMTQ1LjY0LjMxOS45Mi41OTlzLjQ1My41NDYuNTk4LjkyYy4xMS4yODEuMjQuNzA1LjI3NSAxLjQ4NS4wMzkuODQzLjA0NyAxLjA5Ni4wNDcgMy4yMzFzLS4wMDggMi4zODktLjA0NyAzLjIzMmMtLjAzNS43OC0uMTY2IDEuMjAzLS4yNzUgMS40ODVhMi41IDIuNSAwIDAgMS0uNTk5LjkxOWMtLjI4LjI4LS41NDYuNDUzLS45Mi41OTgtLjI4LjExLS43MDQuMjQtMS40ODUuMjc2LS44NDMuMDM4LTEuMDk2LjA0Ny0zLjIzMi4wNDdzLTIuMzktLjAwOS0zLjIzMy0uMDQ3Yy0uNzgtLjAzNi0xLjIwMy0uMTY2LTEuNDg1LS4yNzZhMi41IDIuNSAwIDAgMS0uOTItLjU5OCAyLjUgMi41IDAgMCAxLS42LS45MmMtLjEwOS0uMjgxLS4yNC0uNzA1LS4yNzUtMS40ODUtLjAzOC0uODQzLS4wNDYtMS4wOTYtLjA0Ni0zLjIzM3MuMDA4LTIuMzg4LjA0Ni0zLjIzMWMuMDM2LS43OC4xNjYtMS4yMDQuMjc2LTEuNDg2LjE0NS0uMzczLjMxOS0uNjQuNTk5LS45MnMuNTQ2LS40NTMuOTItLjU5OGMuMjgyLS4xMS43MDUtLjI0IDEuNDg1LS4yNzYuNzM4LS4wMzQgMS4wMjQtLjA0NCAyLjUxNS0uMDQ1em00Ljk4OCAxLjMyOGEuOTYuOTYgMCAxIDAgMCAxLjkyLjk2Ljk2IDAgMCAwIDAtMS45Mm0tNC4yNyAxLjEyMmE0LjEwOSA0LjEwOSAwIDEgMCAwIDguMjE3IDQuMTA5IDQuMTA5IDAgMCAwIDAtOC4yMTdtMCAxLjQ0MWEyLjY2NyAyLjY2NyAwIDEgMSAwIDUuMzM0IDIuNjY3IDIuNjY3IDAgMCAxIDAtNS4zMzQiLz4KPC9zdmc+" alt="Instagram Icon" width="16" height="16" style="vertical-align:middle;">
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

export default sendHourReminder
