import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, q, sort } = params;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : null;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
      _count: { select: { reviews: true } },
    },
    orderBy:
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" },
  });

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-1">
          {activeCategory ? activeCategory.name : q ? `Search: "${q}"` : "All products"}
        </h1>
        <p className="text-stone-500 text-sm">{products.length} items</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-52 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <form method="GET">
              <label className="label">Search</label>
              <div className="relative">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search products…"
                  className="input pr-10"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Categories */}
            <div>
              <p className="label">Category</p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/shop"
                    className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                      !category ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    All
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                        category === cat.slug
                          ? "bg-stone-900 text-stone-50"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort */}
            <div>
              <p className="label">Sort by</p>
              <ul className="space-y-1">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "price_asc", label: "Price: low → high" },
                  { value: "price_desc", label: "Price: high → low" },
                ].map((opt) => (
                  <li key={opt.value}>
                    <Link
                      href={`/shop?${category ? `category=${category}&` : ""}sort=${opt.value}`}
                      className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                        (sort === opt.value || (!sort && opt.value === "newest"))
                          ? "text-stone-900 font-medium"
                          : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <p className="font-display text-3xl mb-2">Nothing found</p>
              <p className="text-sm">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const img = product.images[0];
                return (
                  <Link key={product.id} href={`/shop/${product.id}`} className="group">
                    <div className="product-image-container aspect-square bg-stone-100 overflow-hidden mb-3 relative">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={product.name}
                          fill
                          className="product-image object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {product.compareAt && (
                        <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-0.5 font-medium">Sale</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mb-0.5">{product.category.name}</p>
                    <p className="text-sm font-medium text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                      {product.compareAt && (
                        <span className="text-xs text-stone-400 line-through">{formatPrice(product.compareAt)}</span>
                      )}
                    </div>
                    {product._count.reviews > 0 && (
                      <p className="text-xs text-stone-400 mt-0.5">{product._count.reviews} reviews</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
