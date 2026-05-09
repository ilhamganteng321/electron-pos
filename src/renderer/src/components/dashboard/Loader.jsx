// components/dashboard/DashboardSkeleton.jsx
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-400 mx-auto px-6 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-9 bg-white/5 rounded-lg w-32 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-lg w-64 mt-2 animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-80 h-10 bg-white/5 rounded-xl animate-pulse" />
                <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
                <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/2 border border-white/5 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl" />
                  <div className="w-16 h-5 bg-white/5 rounded-full" />
                </div>
                <div className="h-4 bg-white/5 rounded w-24 mb-2" />
                <div className="h-8 bg-white/5 rounded w-32 mb-3" />
                <div className="h-8 bg-white/5 rounded w-full" />
              </div>
            ))}
          </div>

          {/* Charts Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-white/5 rounded w-32 animate-pulse" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-7 w-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="h-80 bg-white/5 rounded-xl animate-pulse" />
            </div>

            <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
              <div className="h-6 bg-white/5 rounded w-40 mb-6 animate-pulse" />
              <div className="h-80 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
                <div className="h-6 bg-white/5 rounded w-48 mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-lg" />
                        <div>
                          <div className="h-4 bg-white/5 rounded w-32 mb-2" />
                          <div className="h-3 bg-white/5 rounded w-20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/5 rounded w-20 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
                <div className="h-6 bg-white/5 rounded w-40 mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-full" />
                        <div>
                          <div className="h-4 bg-white/5 rounded w-28 mb-1" />
                          <div className="h-3 bg-white/5 rounded w-20" />
                        </div>
                      </div>
                      <div className="h-6 bg-white/5 rounded w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
                <div className="h-6 bg-white/5 rounded w-40 mb-4 animate-pulse" />
                <div className="h-80 bg-white/5 rounded-xl animate-pulse" />
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-white/5 rounded-lg" />
                  <div className="h-5 bg-white/5 rounded w-32" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <div className="h-4 bg-white/5 rounded w-28" />
                        <div className="h-4 bg-white/5 rounded w-12" />
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
              <div className="h-6 bg-white/5 rounded w-40 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl" />
                        <div>
                          <div className="h-4 bg-white/5 rounded w-24 mb-1" />
                          <div className="h-3 bg-white/5 rounded w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-white/5 rounded w-20 mb-1" />
                        <div className="h-3 bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
              <div className="h-6 bg-white/5 rounded w-40 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/5 rounded w-32 mb-1" />
                      <div className="h-3 bg-white/5 rounded w-48" />
                    </div>
                    <div className="h-3 bg-white/5 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
