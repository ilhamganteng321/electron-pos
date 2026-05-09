import { useState, useEffect } from 'react'
import { ArrowPathIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/outline'

export function ProductReport() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [limit, setLimit] = useState(10)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const fetchBestSelling = async () => {
    setLoading(true)
    try {
      const params = { limit }
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start
        params.endDate = dateRange.end
      }

      const res = await window.api.transaction.getBestSelling(params)

      if (res.success) {
        setProducts(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch best selling products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBestSelling()
  }, [limit, dateRange])

  const getPerformanceColor = (index) => {
    if (index === 0) return 'text-yellow-400'
    if (index === 1) return 'text-gray-400'
    if (index === 2) return 'text-amber-600'
    return 'text-white/40'
  }

  const getPerformanceIcon = (index) => {
    if (index < 3) return <TrophyIcon className={`w-4 h-4 ${getPerformanceColor(index)}`} />
    return <StarIcon className="w-4 h-4 text-white/30" />
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-white/50 text-xs mb-2">Jumlah Produk</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-white/4 border border-white/6 rounded-xl px-3 py-2 text-white text-sm"
            >
              <option className="bg-black" value={5}>
                Top 5
              </option>
              <option className="bg-black" value={10}>
                Top 10
              </option>
              <option className="bg-black" value={20}>
                Top 20
              </option>
              <option className="bg-black" value={50}>
                Top 50
              </option>
            </select>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="bg-white/4 border border-white/6 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="bg-white/4 border border-white/6 rounded-xl px-3 py-2 text-white text-sm"
            />
          </div>

          <button
            onClick={fetchBestSelling}
            disabled={loading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          >
            {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Tampilkan'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase mb-2">Total Produk Terjual</p>
          <p className="text-white text-2xl font-bold">
            {products.reduce((sum, p) => sum + p.total_sold, 0)}
          </p>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase mb-2">Total Revenue</p>
          <p className="text-white text-xl font-bold truncate">
            {fmt(products.reduce((sum, p) => sum + p.total_revenue, 0))}
          </p>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase mb-2">Rata-rata per Produk</p>
          <p className="text-white text-xl font-bold">
            {products.length > 0
              ? Math.round(products.reduce((sum, p) => sum + p.total_sold, 0) / products.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Best Selling List */}
      <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6">
          <h3 className="text-white font-semibold text-sm">Produk Terlaris</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="w-6 h-6 text-white/30 animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/30">Belum ada data penjualan</p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {products.map((product, index) => (
              <div key={product.id} className="p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getPerformanceIcon(index)}
                      <span className={`text-sm font-bold ${getPerformanceColor(index)}`}>
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{product.name}</h4>
                        <p className="text-white/40 text-xs mt-1">
                          Stok saat ini: {product.current_stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold">
                          {fmt(product.total_revenue)}
                        </p>
                        <p className="text-white/40 text-xs">Total penjualan</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Terjual:</span>
                        <span className="text-white ml-2 font-semibold">{product.total_sold}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Frekuensi:</span>
                        <span className="text-white ml-2">{product.times_purchased}x</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          style={{
                            width: `${(product.total_sold / products[0].total_sold) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
