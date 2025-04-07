export default ({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventLink,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventLink: string;
}) => {
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
              <td style="padding-top: 16px;">
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                  See you on the run! 🏃‍♂️
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
</html>`;
};