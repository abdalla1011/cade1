import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateOrderTotals } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const { total } = calculateOrderTotals(subtotal);

    // When STRIPE_SECRET_KEY is set, create a real PaymentIntent
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // cents
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: { userId: session.id },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }

    // Demo mode — no real Stripe key
    return NextResponse.json({ clientSecret: null, total, demo: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
