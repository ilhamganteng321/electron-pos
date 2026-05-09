import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

RecentTransactions.propTypes = {
  transactions: PropTypes.string
}

export function RecentTransactions({ transactions }) {
  const [sortColumn, setSortColumn] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortColumn(column)
      setSortOrder('desc')
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const order = sortOrder === 'desc' ? -1 : 1
    if (sortColumn === 'date') return (new Date(a.date) - new Date(b.date)) * order
    if (sortColumn === 'amount') return (a.amount - b.amount) * order
    return 0
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-white/10 text-white/40 border-white/20'
    }
  }

  const getPaymentIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      qris: '📱'
    }
    return icons[method] || '💰'
  }

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null
    return sortOrder === 'desc' ? (
      <ChevronDownIcon className="w-3 h-3" />
    ) : (
      <ChevronUpIcon className="w-3 h-3" />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 text-white/40 text-xs font-medium">Customer</th>
            <th
              className="text-left py-3 text-white/40 text-xs font-medium cursor-pointer hover:text-white/60"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-1">
                Date <SortIcon column="date" />
              </div>
            </th>
            <th className="text-left py-3 text-white/40 text-xs font-medium">Payment</th>
            <th className="text-left py-3 text-white/40 text-xs font-medium">Status</th>
            <th
              className="text-right py-3 text-white/40 text-xs font-medium cursor-pointer hover:text-white/60"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center justify-end gap-1">
                Amount <SortIcon column="amount" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((trx, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <span className="text-white/60 text-xs font-medium">
                      {trx.customer.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{trx.customer}</p>
                    <p className="text-white/30 text-xs">#{trx.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-white/60 text-sm">{formatDate(trx.date)}</td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPaymentIcon(trx.paymentMethod)}</span>
                  <span className="text-white/60 text-sm capitalize">{trx.paymentMethod}</span>
                </div>
              </td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(trx.status)}`}
                >
                  {trx.status}
                </span>
              </td>
              <td className="py-3 text-right">
                <span className="text-white font-semibold">{fmt(trx.amount)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
