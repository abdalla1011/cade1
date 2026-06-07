import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCartItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== userId) return null;
  return item;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getCartItem(id, session.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { quantity } = await req.json();
  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.cartItem.update({ where: { id }, data: { quantity } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getCartItem(id, session.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
