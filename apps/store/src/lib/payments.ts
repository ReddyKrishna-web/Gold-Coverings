import { prisma } from "@uma/db";
import { verifyPaymentSignature } from "./razorpay";
import { sendOrderConfirmation, sendOwnerOrderAlert } from "./notify";

type ConfirmInput = {
  razorpayOrderId: string;
  paymentId: string;
  /** Browser callback includes a signature; verified webhooks do not need one. */
  signature?: string;
};

export async function confirmRazorpayPayment(input: ConfirmInput) {
  if (input.signature && !verifyPaymentSignature({
    orderId: input.razorpayOrderId,
    paymentId: input.paymentId,
    signature: input.signature,
  })) {
    return { ok: false as const, error: "Payment signature verification failed." };
  }

  const order = await prisma.order.findFirst({
    where: { razorpayOrderId: input.razorpayOrderId },
    include: { items: true },
  });

  if (!order) return { ok: false as const, error: "Order not found for this payment." };

  if (order.status === "CANCELLED") {
    return {
      ok: false as const,
      error: "This order was cancelled. The payment needs manual reconciliation.",
    };
  }

  if (order.paymentStatus === "PAID") {
    return { ok: true as const, orderNumber: order.orderNumber, alreadyPaid: true };
  }

  const newlyPaid = await prisma.$transaction(async (tx) => {
    // Only one caller can move the order out of an unpaid state.
    const claimed = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: input.paymentId,
        status: order.status === "PENDING_PAYMENT" ? "CONFIRMED" : order.status,
      },
    });

    if (claimed.count === 0) return false;

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status === "PENDING_PAYMENT" ? "CONFIRMED" : order.status,
        note: "Payment verified with Razorpay",
      },
    });

    await tx.payment.updateMany({
      where: { orderId: order.id, providerOrderId: input.razorpayOrderId },
      data: {
        status: "PAID",
        providerPaymentId: input.paymentId,
        method: "RAZORPAY",
      },
    });

    return true;
  });

  if (newlyPaid) {
    const emailInput = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      totalPaise: order.totalPaise,
      paymentMethod: "Razorpay (online)",
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        lineTotalPaise: item.lineTotalPaise,
      })),
    };
    await Promise.allSettled([sendOrderConfirmation(emailInput), sendOwnerOrderAlert(emailInput)]);
  }

  return { ok: true as const, orderNumber: order.orderNumber, alreadyPaid: !newlyPaid };
}

export async function markRazorpayPaymentFailed(razorpayOrderId: string, reason: string) {
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    select: { id: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { status: "FAILED" },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "PENDING_PAYMENT",
        note: `Payment failed: ${reason}`.slice(0, 240),
      },
    }),
  ]);
}
