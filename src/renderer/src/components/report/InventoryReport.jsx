import { useState, useEffect } from 'react'
import {
  ArrowPathIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'

export function InventoryReport() {
  const [loading, setLoading] = useState(false)
  const [inventory, setInventory] = useState({
    summary: {},
    byStatus: []
  })

  const fetchInventoryReport = async () => {
    setLoading(true)
    try {
      const res = await window.api.transaction.getInventoryReport()
      if (res.success) {
        setInventory(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch inventory report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryReport()
  }, [])

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Habis':
        return <XCircleIcon className="w-5 h-5 text-rose-400" />
      case 'Menipis':
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
      default:
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Habis':
        return 'text-rose-400'
      case 'Menipis':
        return 'text-amber-400'
      default:
        return 'text-emerald-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CubeIcon className="w-4 h-4 text-blue-400" />
            <p className="text-white/40 text-xs uppercase">Total Produk</p>
          </div>
          <p className="text-white text-2xl font-bold">{inventory.summary.total_products || 0}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartPieIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-white/40 text-xs uppercase">Total Stok</p>
          </div>
          <p className="text-white text-2xl font-bold">{inventory.summary.total_stock || 0}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-400" />
            <p className="text-white/40 text-xs uppercase">Stok Menipis</p>
          </div>
          <p className="text-amber-400 text-2xl font-bold">{inventory.summary.low_stock || 0}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="w-4 h-4 text-rose-400" />
            <p className="text-white/40 text-xs uppercase">Habis</p>
          </div>
          <p className="text-rose-400 text-2xl font-bold">{inventory.summary.out_of_stock || 0}</p>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl p-6">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
          Total Nilai Inventaris
        </p>
        <p className="text-white text-3xl font-bold">
          {fmt(inventory.summary.total_inventory_value || 0)}
        </p>
        <p className="text-white/30 text-sm mt-2">
          Rata-rata harga produk: {fmt(inventory.summary.avg_price || 0)}
        </p>
      </div>

      {/* Stock Status Distribution */}
      <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6">
          <h3 className="text-white font-semibold text-sm">Distribusi Status Stok</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="w-6 h-6 text-white/30 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {inventory.byStatus.map((item, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className={`font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{item.count} produk</p>
                    <p className="text-white/40 text-xs">Total stok: {item.total_stock}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Jumlah Produk</span>
                    <span className="text-white/60">
                      {Math.round((item.count / inventory.summary.total_products) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === 'Habis'
                          ? 'bg-rose-500'
                          : item.status === 'Menipis'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(item.count / inventory.summary.total_products) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Nilai Inventaris</span>
                    <span className="text-white/60">{fmt(item.total_value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchInventoryReport}
          disabled={loading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-sm flex items-center gap-2 transition-all"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>
    </div>
  )
}
