import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true, description: true } });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) notFound();

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-8 flex items-center gap-1.5">
        <a href="/shop" className="hover:text-stone-700">Shop</a>
        <span>/</span>
        <a href={`/shop?category=${product.category.slug}`} className="hover:text-stone-700">{product.category.name}</a>
        <span>/</span>
        <span className="text-stone-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-stone-100 overflow-hidden relative">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="aspect-square bg-stone-100 overflow-hidden relative">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">{product.category.name}</p>
          <h1 className="font-display text-4xl text-stone-900 mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-amber-500" : "text-stone-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-stone-500">{avgRating.toFixed(1)} ({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-medium text-stone-900">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-lg text-stone-400 line-through">{formatPrice(product.compareAt)}</span>
                <span className="badge bg-amber-100 text-amber-800">
                  Save {Math.round((1 - product.price / product.compareAt) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-600 leading-relaxed mb-8">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stockQty > 10 ? "bg-green-500" : product.stockQty > 0 ? "bg-amber-500" : "bg-red-400"}`} />
            <span className="text-sm text-stone-600">
              {product.stockQty > 10
                ? "In stock"
                : product.stockQty > 0
                ? `Only ${product.stockQty} left`
                : "Out of stock"}
            </span>
          </div>

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            disabled={product.stockQty === 0}
            isLoggedIn={!!session}
          />

          {/* Metadata */}
          <div className="mt-8 pt-8 border-t border-stone-100 space-y-2">
            <p className="text-xs text-stone-400">SKU: {product.sku}</p>
            <p className="text-xs text-stone-400">Free shipping on orders over $100 · 30-day returns</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-stone-900 mb-6">Customer reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= review.rating ? "text-amber-500" : "text-stone-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-medium">{review.user.name}</span>
                </div>
                {review.title && <p className="text-sm font-medium text-stone-900 mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-stone-600">{review.body}</p>}
                <p className="text-xs text-stone-400 mt-3">
                  {new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
