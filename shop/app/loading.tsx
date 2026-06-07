export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 bg-stone-100 rounded w-48 mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square bg-stone-100 mb-3" />
            <div className="h-3 bg-stone-100 rounded w-16 mb-2" />
            <div className="h-4 bg-stone-100 rounded w-full mb-1" />
            <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-stone-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
