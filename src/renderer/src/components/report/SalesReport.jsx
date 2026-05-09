import { useState, useEffect } from 'react'
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export function SalesReport() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState([])
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    averageValue: 0,
    todayTransactions: 0,
    todayRevenue: 0
  })

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = { period }
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start
        params.endDate = dateRange.end
      }

      const res = await window.api.transaction.getReport(params)

      if (res.success && res.data) {
        setReportData(res.data)

        // Calculate summary
        const totalTransactions = res.data.reduce((sum, d) => sum + d.total_transactions, 0)
        const totalRevenue = res.data.reduce((sum, d) => sum + d.total_revenue, 0)
        const averageValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
        const todayTransactions = res.data[0]?.today_transactions || 0
        const todayRevenue = res.data[0]?.today_revenue || 0

        setSummary({
          totalTransactions,
          totalRevenue,
          averageValue,
          todayTransactions,
          todayRevenue
        })
      }
    } catch (err) {
      console.error('Failed to fetch report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [period, dateRange])

  const formatPeriod = (periodStr) => {
    if (period === 'daily') {
      return new Date(periodStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } else if (period === 'monthly') {
      const [year, month] = periodStr.split('-')
      return new Date(year, month - 1).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      })
    }
    return periodStr
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-white/50 text-xs mb-2">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white/4 border border-white/6 rounded-xl px-3 py-2 text-white text-sm"
            >
              <option className="bg-black" value="daily">
                Harian
              </option>
              <option className="bg-black" value="monthly">
                Bulanan
              </option>
              <option className="bg-black" value="yearly">
                Tahunan
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
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          >
            {loading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarIcon className="w-4 h-4" />
            )}
            Tampilkan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptPercentIcon className="w-4 h-4 text-violet-400" />
            <p className="text-white/40 text-xs uppercase">Total Transaksi</p>
          </div>
          <p className="text-white text-2xl font-bold">{summary.totalTransactions}</p>
          <p className="text-white/30 text-xs mt-1">Hari ini: {summary.todayTransactions}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-white/40 text-xs uppercase">Total Pendapatan</p>
          </div>
          <p className="text-white text-xl font-bold truncate">{fmt(summary.totalRevenue)}</p>
          <p className="text-white/30 text-xs mt-1">Hari ini: {fmt(summary.todayRevenue)}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-blue-400" />
            <p className="text-white/40 text-xs uppercase">Rata-rata Transaksi</p>
          </div>
          <p className="text-white text-xl font-bold">{fmt(summary.averageValue)}</p>
        </div>

        <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingDownIcon className="w-4 h-4 text-amber-400" />
            <p className="text-white/40 text-xs uppercase">Performa</p>
          </div>
          <p className="text-white text-xl font-bold">
            {reportData.length > 1 &&
            reportData[0]?.total_revenue > reportData[1]?.total_revenue ? (
              <span className="text-emerald-400">▲ Meningkat</span>
            ) : (
              <span className="text-amber-400">▼ Menurun</span>
            )}
          </p>
        </div>
      </div>

      {/* Table Report */}
      <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6">
          <h3 className="text-white font-semibold text-sm">
            Detail {period === 'daily' ? 'Harian' : period === 'monthly' ? 'Bulanan' : 'Tahunan'}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="w-6 h-6 text-white/30 animate-spin mx-auto" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/30">Tidak ada data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-white/30 uppercase">
                    Periode
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase">
                    Transaksi
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase">
                    Pendapatan
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase">
                    Rata-rata
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase">
                    Min
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-white/30 uppercase">
                    Max
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((data, idx) => (
                  <tr key={idx} className="border-b border-white/4 hover:bg-white/2">
                    <td className="px-5 py-3 text-white text-sm">{formatPeriod(data.period)}</td>
                    <td className="px-5 py-3 text-right text-white/80">
                      {data.total_transactions}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                      {fmt(data.total_revenue)}
                    </td>
                    <td className="px-5 py-3 text-right text-white/80">
                      {fmt(data.avg_transaction_value)}
                    </td>
                    <td className="px-5 py-3 text-right text-white/60">
                      {fmt(data.min_transaction)}
                    </td>
                    <td className="px-5 py-3 text-right text-white/60">
                      {fmt(data.max_transaction)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
