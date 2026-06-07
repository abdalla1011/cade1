"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  isLoggedIn: boolean;
}

export function AddToCartButton({ productId, disabled, isLoggedIn }: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading}
        className="btn-primary w-full py-4 text-base justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding…
          </span>
        ) : added ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to cart
          </span>
        ) : disabled ? (
          "Out of stock"
        ) : !isLoggedIn ? (
          "Sign in to add to cart"
        ) : (
          "Add to cart"
        )}
      </button>
      {!disabled && (
        <button
          onClick={() => {
            handleAddToCart().then(() => router.push("/cart"));
          }}
          className="btn-secondary w-full py-4 text-base justify-center"
        >
          Buy now
        </button>
      )}
    </div>
  );
}
