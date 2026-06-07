import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.id },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  }

  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity = 1 } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.stockQty < 1) return NextResponse.json({ error: "Out of stock" }, { status: 400 });

  let cart = await prisma.cart.findUnique({ where: { userId: session.id } });
  if (!cart) cart = await prisma.cart.create({ data: { userId: session.id } });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return NextResponse.json({ ok: true });
}
