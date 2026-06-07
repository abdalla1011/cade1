"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartActionsProps {
  itemId: string;
  quantity: number;
  productId: string;
}

export function CartActions({ itemId, quantity, productId }: CartActionsProps) {
  const router = useRouter();
  const [qty, setQty] = useState(quantity);
  const [loading, setLoading] = useState(false);

  const update = async (newQty: number) => {
    setLoading(true);
    setQty(newQty);
    try {
      if (newQty < 1) {
        await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/cart/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQty }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex items-center border border-stone-200">
        <button
          onClick={() => update(qty - 1)}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          onClick={() => update(qty + 1)}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        onClick={() => update(0)}
        disabled={loading}
        className="text-xs text-stone-400 hover:text-red-500 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
