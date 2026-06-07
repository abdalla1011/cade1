import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "My Orders" };

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: {
      items: { include: { product: true }, take: 3 },
      _count: { select: { items: true } },
    },
    orderBy: { placedAt: "desc" },
  });

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-10">Your orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-3xl text-stone-400 mb-3">No orders yet</p>
          <p className="text-stone-500 mb-8">Browse our collection and find something you love.</p>
          <Link href="/shop" className="btn-primary">Shop now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card block p-6 hover:border-stone-300 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-stone-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-stone-500">{formatDate(order.placedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge px-2.5 py-1 capitalize ${statusColors[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium text-stone-900">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="text-sm text-stone-500">
                {order.items.map((item) => item.product.name).join(", ")}
                {order._count.items > 3 && ` and ${order._count.items - 3} more`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
