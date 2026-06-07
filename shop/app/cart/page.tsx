import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, calculateOrderTotals } from "@/lib/utils";
import { CartActions } from "@/components/shop/CartActions";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const { tax, shipping, total } = calculateOrderTotals(subtotal);

  if (items.length === 0) {
    return (
      <div className="page-enter max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-stone-900 mb-3">Your cart is empty</h1>
        <p className="text-stone-500 mb-8">Add something beautiful to get started.</p>
        <Link href="/shop" className="btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-10">Your cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0 divide-y divide-stone-100">
          {items.map((item) => {
            const img = item.product.images[0];
            return (
              <div key={item.id} className="flex gap-5 py-6">
                <div className="w-24 h-24 bg-stone-100 shrink-0 overflow-hidden relative">
                  {img ? (
                    <Image src={img.url} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full bg-stone-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/${item.productId}`}
                    className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-stone-500 mt-1">{formatPrice(item.product.price)}</p>
                  <CartActions itemId={item.id} quantity={item.quantity} productId={item.productId} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-stone-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-medium text-stone-900 mb-6">Order summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-stone-400 pt-1">
                  Add {formatPrice(100 - subtotal)} more for free shipping
                </p>
              )}
            </div>
            <div className="divider mb-4" />
            <div className="flex justify-between font-medium text-stone-900 mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full justify-center py-4">
              Proceed to checkout
            </Link>
            <Link href="/shop" className="btn-ghost w-full justify-center mt-3 text-stone-500">
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
