import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      },
      address: true,
      payment: true,
      shipment: true,
    },
  });

  if (!order || order.userId !== session.id) notFound();

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {placed && (
        <div className="mb-8 p-5 bg-green-50 border border-green-100 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-green-900">Order placed!</p>
            <p className="text-sm text-green-700 mt-0.5">Thank you for your order. We'll send updates as it progresses.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-stone-400 mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
          <h1 className="font-display text-3xl text-stone-900">Order details</h1>
          <p className="text-stone-500 text-sm mt-1">Placed {formatDate(order.placedAt)}</p>
        </div>
        <Link href="/orders" className="btn-ghost text-stone-500">← All orders</Link>
      </div>

      {/* Status tracker */}
      {order.status !== "cancelled" && (
        <div className="card p-6 mb-8">
          <div className="flex items-center">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                      i <= currentStep
                        ? "bg-stone-900 text-stone-50"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {i < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </div>
                  <p className={`text-xs mt-1.5 capitalize ${i <= currentStep ? "text-stone-700 font-medium" : "text-stone-400"}`}>
                    {step}
                  </p>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mt-[-14px] ${i < currentStep ? "bg-stone-900" : "bg-stone-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-medium text-stone-900">Items</h2>
          {order.items.map((item) => {
            const img = item.product.images[0];
            return (
              <div key={item.id} className="card flex gap-4 p-4">
                <div className="w-16 h-16 bg-stone-100 shrink-0 overflow-hidden relative">
                  {img && <Image src={img.url} alt={item.product.name} fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{item.product.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">Qty: {item.quantity} · {formatPrice(item.unitPrice)} each</p>
                </div>
                <p className="text-sm font-medium text-stone-900 shrink-0">{formatPrice(item.lineTotal)}</p>
              </div>
            );
          })}

          {/* Totals */}
          <div className="card p-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="divider" />
            <div className="flex justify-between font-medium text-stone-900"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-6">
          {/* Shipping address */}
          <div className="card p-4">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Shipping to</p>
            <p className="text-sm font-medium text-stone-900">{order.address.name}</p>
            <p className="text-sm text-stone-600">{order.address.line1}</p>
            {order.address.line2 && <p className="text-sm text-stone-600">{order.address.line2}</p>}
            <p className="text-sm text-stone-600">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
          </div>

          {/* Shipment */}
          {order.shipment && order.shipment.trackingNumber && (
            <div className="card p-4">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Tracking</p>
              <p className="text-sm font-medium text-stone-900">{order.shipment.carrier}</p>
              <p className="text-xs text-stone-500 font-mono mt-1">{order.shipment.trackingNumber}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="card p-4">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Notes</p>
              <p className="text-sm text-stone-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
