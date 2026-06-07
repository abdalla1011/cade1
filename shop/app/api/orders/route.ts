import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateOrderTotals } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: {
      items: { include: { product: true } },
      address: true,
      payment: true,
      shipment: true,
    },
    orderBy: { placedAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { addressId, notes } = await req.json();
    if (!addressId) return NextResponse.json({ error: "addressId required" }, { status: 400 });

    // Verify address belongs to user
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== session.id) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Check stock
    for (const item of cart.items) {
      if (item.product.stockQty < item.quantity) {
        return NextResponse.json(
          { error: `"${item.product.name}" only has ${item.product.stockQty} in stock` },
          { status: 400 }
        );
      }
    }

    const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const { tax, shipping, total } = calculateOrderTotals(subtotal);

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.id,
          addressId,
          notes,
          subtotal,
          tax,
          shipping,
          total,
          status: "confirmed",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              lineTotal: item.product.price * item.quantity,
            })),
          },
          payment: {
            create: {
              amount: total,
              currency: "usd",
              status: "paid", // demo: mark as paid immediately
              provider: "stripe",
            },
          },
          shipment: {
            create: { status: "pending" },
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
