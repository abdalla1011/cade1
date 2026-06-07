"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { Address } from "@/types";

interface CheckoutItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Totals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CheckoutFormProps {
  addresses: Address[];
  items: CheckoutItem[];
  totals: Totals;
  userId: string;
}

export function CheckoutForm({ addresses, items, totals, userId }: CheckoutFormProps) {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [addingAddress, setAddingAddress] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    name: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "US",
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !addingAddress) {
      setError("Please select a shipping address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let addressId = selectedAddress;
      if (addingAddress) {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddress),
        });
        if (!res.ok) throw new Error("Failed to save address");
        const data = await res.json();
        addressId = data.id;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId, notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to place order");
      }
      const order = await res.json();
      router.push(`/orders/${order.id}?placed=1`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      {/* Left: address + notes */}
      <div className="lg:col-span-3 space-y-8">
        {/* Shipping address */}
        <section>
          <h2 className="font-medium text-stone-900 mb-4 text-lg">Shipping address</h2>
          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    selectedAddress === addr.id && !addingAddress
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id && !addingAddress}
                    onChange={() => { setSelectedAddress(addr.id); setAddingAddress(false); }}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-stone-900">{addr.name}</p>
                    <p className="text-stone-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                    <p className="text-stone-500">{addr.city}, {addr.state} {addr.postalCode} · {addr.country}</p>
                    {addr.isDefault && <span className="badge bg-stone-100 text-stone-600 mt-1">Default</span>}
                  </div>
                </label>
              ))}
              <button
                onClick={() => setAddingAddress(true)}
                className={`w-full p-4 border text-sm text-left transition-colors ${
                  addingAddress ? "border-stone-900 bg-stone-50" : "border-dashed border-stone-300 text-stone-500 hover:border-stone-500"
                }`}
              >
                + Add new address
              </button>
            </div>
          )}

          {/* New address form */}
          {addingAddress && (
            <div className="space-y-4 p-4 border border-stone-200 bg-stone-50 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Full name</label>
                  <input className="input" placeholder="Jane Smith" value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">Address line 1</label>
                  <input className="input" placeholder="123 Main St" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">Address line 2 (optional)</label>
                  <input className="input" placeholder="Apt, suite, etc." value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" placeholder="San Francisco" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" placeholder="CA" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                </div>
                <div>
                  <label className="label">Postal code</label>
                  <input className="input" placeholder="94105" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Notes */}
        <section>
          <h2 className="font-medium text-stone-900 mb-3 text-lg">Order notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input h-24 resize-none"
            placeholder="Special instructions, gift messages, etc. (optional)"
          />
        </section>

        {/* Payment note */}
        <section className="p-4 bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-900 font-medium mb-1">Payment</p>
          <p className="text-xs text-amber-700">
            This demo places orders without real payment processing. In production, Stripe is pre-wired — just add your keys to <code className="font-mono">.env.local</code>.
          </p>
        </section>
      </div>

      {/* Right: summary */}
      <div className="lg:col-span-2">
        <div className="card p-6 sticky top-24">
          <h2 className="font-medium text-stone-900 mb-5">Order summary</h2>
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600 line-clamp-1 flex-1 pr-3">
                  {item.name} <span className="text-stone-400">× {item.quantity}</span>
                </span>
                <span className="text-stone-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="divider mb-4" />
          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{totals.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(totals.shipping)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax</span><span>{formatPrice(totals.tax)}</span>
            </div>
          </div>
          <div className="divider mb-4" />
          <div className="flex justify-between font-medium text-stone-900 mb-6">
            <span>Total</span><span>{formatPrice(totals.total)}</span>
          </div>
          {error && (
            <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 border border-red-100">{error}</p>
          )}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-base"
          >
            {loading ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
