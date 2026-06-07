import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl text-stone-100 mb-3">Maison</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              Thoughtfully curated goods for the way you live.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Shop</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-stone-100 transition-colors">All products</Link></li>
              <li><Link href="/shop?category=electronics" className="hover:text-stone-100 transition-colors">Electronics</Link></li>
              <li><Link href="/shop?category=clothing" className="hover:text-stone-100 transition-colors">Clothing</Link></li>
              <li><Link href="/shop?category=home" className="hover:text-stone-100 transition-colors">Home & Living</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-stone-100 transition-colors">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-stone-100 transition-colors">Register</Link></li>
              <li><Link href="/orders" className="hover:text-stone-100 transition-colors">Orders</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Info</p>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">About</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Shipping policy</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Returns</span></li>
              <li><span className="hover:text-stone-100 transition-colors cursor-pointer">Privacy</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-600">© {new Date().getFullYear()} Maison. All rights reserved.</p>
          <p className="text-xs text-stone-700">Free shipping on orders over $100 · 30-day returns</p>
        </div>
      </div>
    </footer>
  );
}
