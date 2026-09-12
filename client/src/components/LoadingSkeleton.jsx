export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-sm"
        >
          {/* Poster Skeleton */}
          <div className="shimmer aspect-[2/3] w-full bg-slate-800" />

          {/* Text Skeleton */}
          <div className="p-3.5">
            <div className="shimmer h-4 w-5/6 rounded bg-slate-800" />
            <div className="mt-2 flex items-center justify-between">
              <div className="shimmer h-3 w-1/4 rounded bg-slate-800" />
              <div className="shimmer h-3 w-1/3 rounded bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MovieDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-9 w-24 rounded-lg bg-slate-800 shimmer" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Poster */}
        <div className="aspect-[2/3] w-full rounded-2xl bg-slate-800 shimmer" />

        {/* Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="h-8 w-3/4 rounded bg-slate-800 shimmer" />
          <div className="h-4 w-1/3 rounded bg-slate-800 shimmer" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-800 shimmer" />
            <div className="h-6 w-20 rounded-full bg-slate-800 shimmer" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full rounded bg-slate-800 shimmer" />
            <div className="h-4 w-full rounded bg-slate-800 shimmer" />
            <div className="h-4 w-2/3 rounded bg-slate-800 shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieGridSkeleton;
