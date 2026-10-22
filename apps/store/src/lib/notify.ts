import { BRAND, STORE_URL, formatINR } from "@uma/brand";

type Mail = { to: string; subject: string; html: string; replyTo?: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendMail(mail: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Krishna Jewellers <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(`[email skipped] ${mail.subject}`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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

type OrderEmailInput = {
  orderNumber: string;
  customerName: string;
  email: string;
  totalPaise: number;
  paymentMethod: string;
  items: { name: string; quantity: number; lineTotalPaise: number }[];
};

const shell = (title: string, body: string) => `
  <div style="background:#FFF9EC;padding:32px 16px;font-family:Arial,sans-serif;color:#0E0B07">
    <div style="max-width:560px;margin:0 auto;background:#fffdf7;border:1px solid #e6d7a8;padding:28px">
      <p style="font-family:Georgia,serif;font-size:22px;margin:0;color:#0E0B07">${escapeHtml(BRAND.name)}</p>
      <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8860B;margin:6px 0 22px">Gold covering jewellery</p>
      <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>
      ${body}
      <p style="font-size:11px;color:#777;margin-top:26px">
        ${escapeHtml(BRAND.contact.phone)} · ${escapeHtml(BRAND.contact.email)}<br/>
        <a href="${STORE_URL}" style="color:#7A5A12">${STORE_URL}</a>
      </p>
    </div>
  </div>
`;

export async function sendOrderConfirmation(input: OrderEmailInput) {
  const rows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-size:13px">${escapeHtml(item.name)} × ${item.quantity}</td>
         <td style="padding:6px 0;font-size:13px;text-align:right">${formatINR(item.lineTotalPaise)}</td></tr>`
    )
    .join("");

  const body = `
    <p style="font-size:13px;line-height:1.7">Thank you, ${escapeHtml(input.customerName)}. We have your order
    <strong>${escapeHtml(input.orderNumber)}</strong> and will update you as it moves through packing and delivery.</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #eee;font-size:13px"><strong>Total</strong></td>
      <td style="padding-top:10px;border-top:1px solid #eee;text-align:right"><strong>${formatINR(input.totalPaise)}</strong></td></tr>
    </table>
    <p style="font-size:12px;color:#666">Payment method: ${escapeHtml(input.paymentMethod)}</p>
    <p style="font-size:12px;color:#666">Our pieces are gold covering / gold plated, not solid gold. Keep them away from perfume and water.</p>
  `;

  return sendMail({
    to: input.email,
    subject: `Order ${input.orderNumber} confirmed — ${BRAND.name}`,
    html: shell("Your order is confirmed", body),
    replyTo: BRAND.contact.email,
  });
}

export async function sendOwnerOrderAlert(input: OrderEmailInput) {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return false;

  const rows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;font-size:13px">${escapeHtml(item.name)} × ${item.quantity}</td>
         <td style="padding:4px 0;font-size:13px;text-align:right">${formatINR(item.lineTotalPaise)}</td></tr>`
    )
    .join("");

  const body = `
    <p style="font-size:13px">New order <strong>${escapeHtml(input.orderNumber)}</strong> from ${escapeHtml(input.customerName)}
    (${escapeHtml(input.email)}).</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="font-size:13px">Total: <strong>${formatINR(input.totalPaise)}</strong> · ${escapeHtml(input.paymentMethod)}</p>
    <p style="font-size:13px"><a href="${STORE_URL}/admin/orders" style="color:#7A5A12">Open the admin dashboard</a></p>
  `;

  return sendMail({
    to: ownerEmail,
    subject: `New order ${input.orderNumber} — ${formatINR(input.totalPaise)}`,
    html: shell("New order received", body),
  });
}
