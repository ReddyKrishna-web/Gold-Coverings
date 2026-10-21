import { prisma, type OrderStatus, type Prisma } from "@uma/db";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

/**
 * Permitted fulfilment transitions. Cancellation is allowed from any
 * pre-shipping state; money-related states are handled deliberately.
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "PACKED", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED", "RETURNED"],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Human-readable, collision-resistant order number (not a tax invoice number). */
export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.floor(Math.random() * 36 ** 2)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `UF-${stamp}${random}`;
}

/** Restores stock exactly once when an order is cancelled before fulfilment. */
export async function restoreOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string,
  actorId: string | null,
  note: string
) {
  const items = await tx.orderItem.findMany({
    where: { orderId, variantId: { not: null } },
    select: { variantId: true, quantity: true },
  });

  for (const item of items) {
    if (!item.variantId) continue;
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: item.variantId,
        delta: item.quantity,
        reason: "RETURN",
        note,
        actorId,
      },
    });
  }
}

export async function writeAuditLog(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Prisma.InputJsonValue
) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, meta },
  });
}

export function orderStatusTone(status: OrderStatus): string {
  if (status === "DELIVERED" || status === "CONFIRMED" || status === "SHIPPED") return "badge-paid";
  if (status === "CANCELLED" || status === "REFUNDED" || status === "RETURNED") return "badge-failed";
  if (status === "PENDING_PAYMENT") return "badge-pending";
  return "badge-neutral";
}
