const verifyEmailTemplate = ({ token }: { token: string }) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Verify Your Email</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f0fdf4; font-family: Arial, sans-serif;">
      <center>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0fdf4" style="padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding: 40px;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <h1 style="color:#047857; font-size:28px; margin: 0;">Baie D'Urfé Social Run Club</h1>
                    <p style="color:#4b5563; font-size:16px; margin: 10px 0 0;">Let's get you up and running 🚀</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <h2 style="color:#111827; font-size:22px; margin: 0 0 20px;">Verify Your Email Address</h2>
                    <p style="color:#4b5563; font-size:16px; margin: 0 0 30px;">
                      Thanks for signing up! Please confirm your email address by clicking the button below.
                    </p>
                    <a href="${url}" style="background-color:#047857; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block; font-size:16px;">
                      Verify Email
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 30px;">
                    <p style="color:#6b7280; font-size:14px; margin: 0 0 10px;">
                      If you did not create an account, no further action is required.
                    </p>
                    <p style="color:#9ca3af; font-size:12px; margin: 0;">
                      &copy; ${year} Baie D'Urfé Social Run Club. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
  </html>`
}

export default verifyEmailTemplate
