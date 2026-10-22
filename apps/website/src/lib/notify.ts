/**
 * Optional email notifications. The site works fine without them — if no
 * RESEND_API_KEY is configured the message is logged only. Add the key in the
 * hosting dashboard to start sending. No SDK or card details are involved.
 */
type Mail = { to: string; subject: string; html: string; replyTo?: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMail(mail: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Krishna Jewellers <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[email skipped] ${mail.subject}`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[email] Resend rejected the message", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Could not send notification:", error);
    return false;
  }
}
