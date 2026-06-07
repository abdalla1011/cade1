import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, line1, line2, city, state, postalCode, country = "US", isDefault = false } = await req.json();

  if (!name || !line1 || !city || !state || !postalCode) {
    return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
  }

  // If setting as default, unset others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    });
  }

  // First address is always default
  const count = await prisma.address.count({ where: { userId: session.id } });

  const address = await prisma.address.create({
    data: {
      userId: session.id,
      name,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || count === 0,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
