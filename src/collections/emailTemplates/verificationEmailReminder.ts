import { User } from "@/payload-types"

const verificationReminderTemplate = ({ user }: { user: User  }) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${user._verificationToken}`
    const year = new Date().getFullYear()
    // Calculate expiration date (7 days from user creation)
    const createdAt = new Date(user.createdAt) // Assuming `createdAt` exists on the user object
    const expirationDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Verify Your Account</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: sans-serif; color: #1f2937;">
            <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <tr>
                <td style="background-color: #16a34a; color: #ffffff; text-align: center; padding: 40px 20px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                <h1 style="font-size: 28px; margin: 0;">Baie D'Urfé Social Run Club</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 32px 24px;">
                <h2 style="font-size: 22px; margin-bottom: 12px;">You're Almost There!</h2>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                    Hi, ${user.firstName}, 
                </p>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                    This is a reminder to verify your email. You won't be able to log in until you do.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Verify My Account
                    </a>
                </div>
                <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">
                    For security, your account will be deleted if not verified by <strong>${expirationDate}</strong>.
                </p>
                <p style="font-size: 14px; color: #4b5563;">If you didn't sign up, you can ignore this message.</p>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; font-size: 12px; color: #9ca3af; padding: 24px;">
                &copy; ${year} Baie D'Urfé Social Run Club. All rights reserved.
                </td>
            </tr>
            </table>
        </body>
        </html>`
        }

export default verificationReminderTemplate
  