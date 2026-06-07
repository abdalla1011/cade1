"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { SessionUser } from "@/types";

interface NavbarProps {
  session: SessionUser | null;
}

export function Navbar({ session }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const count = data.items?.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          ) ?? 0;
          setCartCount(count);
        }
      } catch {}
    };
    fetchCart();
  }, [session, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=electronics", label: "Electronics" },
    { href: "/shop?category=clothing", label: "Clothing" },
    { href: "/shop?category=home", label: "Home" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-stone-50/95 backdrop-blur-sm border-b border-stone-200" : "bg-stone-50 border-b border-stone-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl text-stone-900 tracking-tight hover:opacity-80 transition-opacity"
          >
            Maison
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link href="/orders" className="btn-ghost hidden sm:flex">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Orders
                </Link>
                <Link href="/cart" className="btn-ghost relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-stone-50 text-xs flex items-center justify-center rounded-full font-medium">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleSignOut} className="btn-ghost text-stone-500 hidden sm:flex">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost hidden sm:flex">Sign in</Link>
                <Link href="/register" className="btn-primary">Get started</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-100 py-4 animate-slide-down">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2.5 text-sm text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <>
                  <Link href="/orders" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm text-stone-700">Orders</Link>
                  <button onClick={handleSignOut} className="text-left px-2 py-2.5 text-sm text-stone-500">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm text-stone-700">Sign in</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="px-2 py-2.5 text-sm text-stone-700">Register</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
