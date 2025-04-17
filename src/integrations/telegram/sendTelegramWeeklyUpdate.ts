import axios from 'axios';

/**
 * Escape only text content — not URLs or tags
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format the weekly message using HTML (for Telegram)
 */
export function formatNextWeekRunsTelegramMessage(runs: any[]): string {
  const baseUrl = process.env.CLIENT_URL || 'https://your-site.com';

  const runItems = runs
    .map((run) => {
      const title = escapeHtml(run.title);
      const location = escapeHtml(run.startingLocation);

      const dateStr = escapeHtml(
        new Date(run.eventTime).toLocaleString('en-US', {
          timeZone: 'America/Toronto',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );

      const eventUrl = `${baseUrl}/events/${run.id}`; // no escaping here
      const link = `<a href="${eventUrl}">View Details</a>`; // clickable ✅

      return [
        `🏃 <b>${title}</b>`,
        `📍 <b>Location:</b> ${location}`,
        `🕒 <b>Time:</b> ${dateStr}`,
        `🔗 ${link}`,
      ].join('\n');
    })
    .join('\n\n');

  const header = `<b>${escapeHtml("Next Week's Runs Are Live! 🏃‍♂️")}</b>`;
  const intro = escapeHtml("Hey runners! Here’s the schedule for next week:");
  const footer = escapeHtml("Don't forget to register early so we know who's coming!\n— The Baie D'Urfé Social Run Club Team");

  return `${header}\n\n${intro}\n\n${runItems}\n\n${footer}`;
}

/**
 * Send the message to Telegram group using HTML formatting
 */
export async function sendTelegramWeeklyUpdate(runs: any[]) {
  const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API_TOKEN}/sendMessage`;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = formatNextWeekRunsTelegramMessage(runs);

  try {
    await axios.post(telegramApiUrl, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML', // HTML is more reliable for links
      disable_web_page_preview: false,
    });
    console.log('✅ Message sent to Telegram');
  } catch (error: any) {
    console.error('❌ Failed to send Telegram message:', error.response?.data || error.message);
  }
}
