import { useState, useEffect } from 'react'
import {
  ShoppingBagIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { TransactionForm } from '../components/transaction/Form'
import { TransactionList } from '../components/transaction/List'
import { Toast } from '../components/product/Toast'
import { useQuery } from '@tanstack/react-query'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Transaction() {
  const [activeTab, setActiveTab] = useState('new')
  const [toast, setToast] = useState({
    visible: false,
    msg: '',
    type: 'success'
  })

  const {
    data: transactions = [],
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await window.api.transaction.getAll()

      if (!res.success) {
        throw new Error('Gagal mengambil data transaksi')
      }

      return res.data || []
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + T → Tab Transaksi Baru
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault()
        setActiveTab('new')
        return
      }

      // Ctrl + H → Tab Riwayat
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault()
        setActiveTab('history')
        return
      }

      // Ctrl + F → Fokus Pencarian Produk (di-handle oleh TransactionForm via event)
      // Emit custom event agar bisa ditangkap oleh child component
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        if (activeTab !== 'new') setActiveTab('new')
        window.dispatchEvent(new CustomEvent('transaction:focus-search'))
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

  // ─── Handlers ────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, msg, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 3000)
  }

  const handleTransactionSuccess = async () => {
    showToast('Transaksi berhasil! ✓')
    await refetch()
    setActiveTab('history')
  }

  // Stats
  const totalTransactions = transactions.length

  const totalRevenue = transactions.reduce((sum, trx) => {
    return sum + (trx.total || 0)
  }, 0)

  const todayTransactions = transactions.filter((trx) => {
    const today = new Date().toDateString()
    const trxDate = new Date(trx.created_at * 1000).toDateString()
    return trxDate === today
  }).length

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaksi</h1>
          <p className="text-white/40 text-sm mt-1">Kelola penjualan dan histori transaksi</p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/8 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptPercentIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Total Transaksi</p>
          </div>
          <p className="text-white text-2xl font-bold">{totalTransactions}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="w-4 h-4 text-violet-400" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Total Pendapatan</p>
          </div>
          <p className="text-white text-xl font-bold truncate">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(totalRevenue)}
          </p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBagIcon className="w-4 h-4 text-amber-400" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Transaksi Hari Ini</p>
          </div>
          <p className="text-white text-2xl font-bold">{todayTransactions}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-end justify-between mb-4 border-b border-white/6">
        <div className="flex gap-2">
          {/* Tab: Transaksi Baru — Ctrl+T */}
          <button
            onClick={() => setActiveTab('new')}
            title="Transaksi Baru (Ctrl+T)"
            className={`px-4 py-2 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === 'new' ? 'text-violet-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            Transaksi Baru
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-mono rounded bg-white/6 text-white/25 border border-white/8">
              Ctrl+T
            </kbd>
            {activeTab === 'new' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full" />
            )}
          </button>

          {/* Tab: Riwayat — Ctrl+H */}
          <button
            onClick={() => setActiveTab('history')}
            title="Riwayat Transaksi (Ctrl+H)"
            className={`px-4 py-2 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === 'history' ? 'text-violet-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            Riwayat Transaksi
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-mono rounded bg-white/6 text-white/25 border border-white/8">
              Ctrl+H
            </kbd>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Shortcut legend — kanan tab bar */}
        <div className="hidden sm:flex items-center gap-3 pb-2 text-white/20 text-[10px]">
          {[
            { keys: ['Ctrl', 'F'], label: 'Cari Produk' },
            { keys: ['Esc'], label: 'Tutup Modal' }
          ].map(({ keys, label }) => (
            <span key={label} className="flex items-center gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="px-1 py-0.5 font-mono rounded bg-white/5 border border-white/8"
                >
                  {k}
                </kbd>
              ))}
              <span className="ml-0.5">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'new' ? (
          <TransactionForm onSuccess={handleTransactionSuccess} />
        ) : (
          <TransactionList
            transactions={transactions}
            loading={isLoading || isRefetching}
            onRefresh={refetch}
          />
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  )
}
