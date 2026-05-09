// components/dashboard/Dashboard.jsx

import { useState } from 'react'

import { Header } from '../components/dashboard/Header'
import { StatCard } from '../components/dashboard/StatCard'
import { SalesChart } from '../components/dashboard/SalesChart'
import { RevenueExpenseChart } from '../components/dashboard/RevenueExpenseChart'
import { TopProducts } from '../components/dashboard/TopProduct'
import { RecentTransactions } from '../components/dashboard/RecentTransaction'
import { LowStockAlert } from '../components/dashboard/LowStockAlert'
import { RevenueSummary } from '../components/dashboard/RevenueSummary'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeLine'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { DashboardSkeleton } from '../components/dashboard/LOader'
import { useDashboardData } from '../hooks/useDataDashboard'

export default function Dashboard() {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching, // Untuk mengetahui sedang fetch ulang
    isError
  } = useDashboardData()
  const [filter, setFilter] = useState('monthly')

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Failed to Load Dashboard</h3>
          <p className="text-white/40 text-sm mb-4">{error?.message || 'Something went wrong'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Failed to Load Dashboard</h3>
          <p className="text-white/40 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const dashboardData = data || getEmptyDashboardData()

  const stats = [
    {
      title: 'Total Revenue',
      value: dashboardData?.revenue?.total || 0,
      change: dashboardData?.revenueSummary?.monthGrowth || '0%',
      trend: (dashboardData?.revenueSummary?.monthGrowth || '0%').startsWith('+') ? 'up' : 'down',
      icon: CurrencyDollarIcon,
      color: 'emerald',
      prefix: 'Rp',
      sparkline: dashboardData?.sparklines?.revenue || []
    },
    {
      title: 'Total Transactions',
      value: dashboardData?.transactions?.total || 0,
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'blue',
      sparkline: dashboardData?.sparklines?.transactions || []
    },
    {
      title: 'Total Products',
      value: dashboardData?.products?.total || 0,
      change: '-2.1%',
      trend: 'down',
      icon: CubeIcon,
      color: 'orange',
      sparkline: dashboardData?.sparklines?.products || []
    },
    {
      title: 'Total Customers',
      value: dashboardData?.customers?.total || 0,
      change: '+15.3%',
      trend: 'up',
      icon: UsersIcon,
      color: 'violet',
      sparkline: dashboardData?.sparklines?.customers || []
    }
  ]

  function getEmptyDashboardData() {
    return {
      revenue: { total: 0 },
      transactions: { total: 0 },
      products: { total: 0 },
      customers: { total: 0 },
      sparklines: {
        revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        transactions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        products: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        customers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      salesData: { labels: [], values: [] },
      revenueExpenseData: { labels: [], revenue: [], expense: [] },
      topProducts: [],
      recentTransactions: [],
      categoryData: [],
      lowStockProducts: [],
      revenueSummary: {
        today: 0,
        todayGrowth: '0%',
        week: 0,
        weekGrowth: '0%',
        month: 0,
        monthGrowth: '0%',
        target: 0,
        progress: 0
      },
      activities: []
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Premium Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-400 mx-auto px-6 py-8">
          <Header onRefresh={refetch} isLoading={isFetching} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-white/3 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Sales Analytics</h3>
                <div className="flex gap-2">
                  {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setFilter(period.toLowerCase())}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                        filter === period.toLowerCase()
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <SalesChart filter={filter} data={data?.salesData || { labels: [], values: [] }} />
            </div>

            <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-white/3 transition-all duration-300">
              <h3 className="text-white font-semibold text-lg mb-6">Revenue vs Expense</h3>
              <RevenueExpenseChart
                data={data?.revenueExpenseData || { labels: [], revenue: [], expense: [] }}
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Top Selling Products</h3>
                <TopProducts products={data?.topProducts || []} />
              </div>
              <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Recent Transactions</h3>
                <RecentTransactions transactions={data?.recentTransactions || []} />
              </div>
            </div>

            <div className="space-y-6">
              <LowStockAlert products={data?.lowStockProducts || []} />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueSummary
              data={
                data?.revenueSummary || {
                  today: 0,
                  todayGrowth: '0%',
                  week: 0,
                  weekGrowth: '0%',
                  month: 0,
                  monthGrowth: '0%',
                  target: 0,
                  progress: 0
                }
              }
            />
            <ActivityTimeline activities={data?.activities || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
