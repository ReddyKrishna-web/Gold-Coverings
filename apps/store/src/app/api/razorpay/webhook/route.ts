import { prisma, Prisma } from "@uma/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { confirmRazorpayPayment, markRazorpayPaymentFailed } from "@/lib/payments";

export const dynamic = "force-dynamic";

type RazorpayWebhook = {
  event?: string;
  event_id?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; error_description?: string } };
    order?: { entity?: { id?: string } };
  };
};

/** Razorpay expects a 2xx to stop retrying; 4xx/5xx trigger retries. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[razorpay] Webhook signature rejected");
    return new Response("Invalid signature", { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const eventId =
    event.event_id ??
    `derived_${event.event ?? "unknown"}_${payment?.id ?? event.payload?.order?.entity?.id ?? "na"}`;

  // Idempotency: a duplicate delivery is acknowledged without reprocessing.
  try {
    await prisma.webhookEvent.create({ data: { eventId, provider: "razorpay" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ status: "duplicate" });
    }
    console.error("[razorpay] Could not record webhook event:", error);
    return new Response("Could not record event", { status: 500 });
  }

  try {
    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;
        const paymentId = payment?.id;
        if (!orderId || !paymentId) {
          console.warn("[razorpay] Webhook missing order/payment id", event.event);
          break;
        }
        const result = await confirmRazorpayPayment({
          razorpayOrderId: orderId,
          paymentId,
        });
        if (!result.ok) {
          console.error("[razorpay] Could not confirm paid order:", result.error);
          // Return 500 so Razorpay retries; the event row is removed to allow reprocessing.
          await prisma.webhookEvent.delete({ where: { eventId } }).catch(() => undefined);
          return new Response("Order confirmation failed", { status: 500 });
        }
        break;
      }
      case "payment.failed": {
        const orderId = payment?.order_id;
        if (orderId) {
          await markRazorpayPaymentFailed(
            orderId,
            payment?.error_description ?? "Payment declined by provider"
          );
        }
        break;
      }
      default:
        // Unhandled but valid events are acknowledged.
        break;
    }

    await prisma.webhookEvent.update({
      where: { eventId },
      data: { processedAt: new Date() },
    });

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("[razorpay] Webhook processing failed:", error);
    await prisma.webhookEvent.delete({ where: { eventId } }).catch(() => undefined);
    return new Response("Webhook processing failed", { status: 500 });
  }
}
