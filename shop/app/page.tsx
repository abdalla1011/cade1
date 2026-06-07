import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-transparent to-stone-900" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 md:py-48">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] mb-6 font-medium">
              Curated collection · New arrivals
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-stone-50 leading-[1.05] mb-8">
              Objects worth
              <br />
              living with.
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-md">
              Carefully selected electronics, clothing, and home goods that earn
              their place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary px-8 py-4 text-base">
                Shop the collection
              </Link>
              <Link
                href="/shop?category=home"
                className="px-8 py-4 text-base text-stone-300 border border-stone-700 hover:border-stone-400 hover:text-stone-50 transition-colors"
              >
                New arrivals →
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
      </section>

      {/* Trust bar */}
      <section className="bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200">
            {[
              { icon: "🚚", label: "Free shipping", sub: "Orders over $100" },
              { icon: "↩", label: "30-day returns", sub: "No questions asked" },
              { icon: "✓", label: "Curated quality", sub: "Every item vetted" },
              { icon: "🔒", label: "Secure checkout", sub: "256-bit encryption" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-6 py-4">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-medium text-stone-900">{item.label}</p>
                  <p className="text-xs text-stone-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Browse by</p>
            <h2 className="section-title">Categories</h2>
          </div>
          <Link href="/shop" className="text-sm text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">
            All products →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const colors = ["bg-stone-900", "bg-amber-800", "bg-stone-700"];
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`${colors[i % colors.length]} p-8 group cursor-pointer relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300" />
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-2">
                  {cat._count.products} products
                </p>
                <p className="font-display text-3xl text-stone-50 mb-4">{cat.name}</p>
                <span className="text-stone-300 text-sm group-hover:text-stone-50 transition-colors">
                  Explore →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Hand-picked</p>
            <h2 className="section-title">Featured goods</h2>
          </div>
          <Link href="/shop" className="text-sm text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const img = product.images[0];
            return (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group"
              >
                <div className="product-image-container aspect-square bg-stone-100 overflow-hidden mb-3 relative">
                  {img ? (
                    <Image
                      src={img.url}
                      alt={product.name}
                      fill
                      className="product-image object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.compareAt && (
                    <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-0.5 font-medium">
                      Sale
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mb-1">{product.category.name}</p>
                <p className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2 mb-2">
                  {product.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                  {product.compareAt && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatPrice(product.compareAt)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="font-display text-4xl text-stone-900 mb-4">Free shipping over $100</p>
          <p className="text-stone-600 mb-8">Plus free returns within 30 days on every order.</p>
          <Link href="/shop" className="btn-primary">Start shopping</Link>
        </div>
      </section>
    </div>
  );
}
