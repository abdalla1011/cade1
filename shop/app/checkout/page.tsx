import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateOrderTotals } from "@/lib/utils";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/checkout");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) redirect("/cart");

  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totals = calculateOrderTotals(subtotal);

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-10">Checkout</h1>
      <CheckoutForm
        addresses={addresses}
        items={cart.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        }))}
        totals={totals}
        userId={session.id}
      />
    </div>
  );
}
