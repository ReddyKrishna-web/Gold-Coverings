import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmRazorpayPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

const schema = z.object({
  razorpay_order_id: z.string().min(4),
  razorpay_payment_id: z.string().min(4),
  razorpay_signature: z.string().min(10),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Missing payment details." }, { status: 400 });
  }

  try {
    const result = await confirmRazorpayPayment({
      razorpayOrderId: parsed.data.razorpay_order_id,
      paymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, orderNumber: result.orderNumber });
  } catch (error) {
    console.error("[payments] Verification failed:", error);
    return NextResponse.json(
      { ok: false, error: "We could not verify the payment. Please contact the store." },
      { status: 500 }
    );
  }
}
