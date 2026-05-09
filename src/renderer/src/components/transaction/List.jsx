import { useState } from 'react'
import { InboxIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { TransactionDetail } from './Detail'

export function TransactionList({ transactions, loading }) {
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const fmtDate = (ts) => {
    const date = new Date(ts * 1000)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="bg-white/3 border border-white/6 rounded-2xl p-8">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="w-6 h-6 text-white/30 animate-spin" />
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white/3 border border-white/6 rounded-2xl py-16 text-center">
        <InboxIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
        <p className="text-white/30 text-sm">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Tanggal
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Bayar
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Kembali
                </th>
                <th className="px-5 py-3 text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="border-b border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-white/25 text-xs font-mono">#{trx.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-white/60 text-xs">{fmtDate(trx.created_at)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-white text-sm font-semibold">{fmt(trx.total)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-emerald-400 text-sm font-semibold">{fmt(trx.paid)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-white/60 text-sm">{fmt(trx.change)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleViewDetail(trx)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-violet-400 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetail
        open={detailOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setDetailOpen(false)
          setSelectedTransaction(null)
        }}
      />
    </>
  )
}

TransactionList.propTypes = {
  transactions: PropTypes.array,
  loading: PropTypes.bool
}
