export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-charcoal-800 rounded" />
          <div className="h-8 w-64 bg-charcoal-800 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-charcoal-800 rounded-xl" />
      </div>

      {/* KPI Cards Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-charcoal-800 rounded" />
              <div className="h-5 w-5 bg-charcoal-800 rounded-full" />
            </div>
            <div className="h-8 w-32 bg-charcoal-800 rounded" />
            <div className="h-3 w-40 bg-charcoal-800 rounded" />
          </div>
        ))}
      </div>

      {/* 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="h-6 w-48 bg-charcoal-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-charcoal-950 border border-charcoal-800 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="h-6 w-48 bg-charcoal-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-charcoal-950 border border-charcoal-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
