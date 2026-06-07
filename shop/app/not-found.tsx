import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <p className="font-display text-8xl text-stone-200 mb-4">404</p>
        <h1 className="font-display text-3xl text-stone-900 mb-3">Page not found</h1>
        <p className="text-stone-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
