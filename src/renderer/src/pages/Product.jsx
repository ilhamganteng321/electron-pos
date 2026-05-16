import { useState } from 'react'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ArrowPathIcon,
  InboxIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { SkeletonRow } from '../components/product/SkeletonRow'
import { StockBadge } from '../components/product/StockBadge'
import { AddProductModal } from '../components/product/AddProductModal'
import { Toast } from '../components/product/Toast'
import { EditProductModal } from '../components/product/EditModalProduct'
import { useQuery } from '@tanstack/react-query'

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n)

const fmtDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
// ─── Main Component ──────────────────────────────────────────────────────────
export default function Product() {
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toast, setToast] = useState({ visible: false, msg: '', type: 'success' })
  const {
    data: products = [],
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await window.api.product.getAll()
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30, // Cache disimpan 30 menit
    refetchInterval: 15000, // Auto-refresh setiap 30 detik
    refetchIntervalInBackground: true, // Tetap refresh meski tab tidak aktif
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, msg, type })
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000)
  }

  const handleAddSuccess = (id) => {
    showToast(`Produk berhasil ditambahkan (ID: ${id}) ✓`)
    refetch()
  }

  const handleEditSuccess = (action, id) => {
    if (action === 'update') {
      showToast(`Produk berhasil diperbarui (ID: ${id}) ✓`)
    } else if (action === 'delete') {
      showToast(`Produk berhasil dihapus (ID: ${id}) ✓`)
    }
    refetch()
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setEditModalOpen(true)
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const lowStock = products.filter((p) => p.stock <= 5).length

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Produk</h1>
          <p className="text-white/40 text-sm mt-1">
            {isLoading ? 'Memuat data...' : `${products.length} produk terdaftar`}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Total Produk</p>
          <p className="text-white text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Nilai Inventori</p>
          <p className="text-white text-xl font-bold truncate">{fmt(totalValue)}</p>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Stok Menipis</p>
          <p className={`text-2xl font-bold ${lowStock > 0 ? 'text-amber-400' : 'text-white'}`}>
            {lowStock}
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="flex-1 bg-white/3 border border-white/6 rounded-2xl overflow-hidden flex flex-col min-h-0">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/4 border border-white/6 rounded-xl pl-9 pr-4 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40 focus:bg-white/[0.07] transition-all w-60"
            />
          </div>
          <button
            onClick={() => isRefetching}
            className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {['ID', 'Nama Produk', 'Harga', 'Stok', 'Dibuat', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <InboxIcon className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">
                      {search
                        ? `Tidak ada hasil untuk "${search}"`
                        : 'Belum ada produk. Tambahkan yang pertama!'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors group"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-white/25 text-xs font-mono">#{p.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/10 flex items-center justify-center shrink-0">
                          <CubeIcon className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <span className="text-white text-sm font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white/80 text-sm font-semibold tabular-nums">
                        {fmt(p.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm tabular-nums">{p.stock}</span>
                        <StockBadge stock={p.stock} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white/30 text-xs">{fmtDate(p.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-violet-400"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5">
            <p className="text-white/25 text-xs">
              Menampilkan <span className="text-white/50 font-semibold">{filtered.length}</span>{' '}
              dari <span className="text-white/50 font-semibold">{products.length}</span> produk
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={handleEditSuccess}
        productId={selectedProduct?.id}
      />

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  )
}
