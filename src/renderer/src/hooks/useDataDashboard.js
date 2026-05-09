// hooks/useDashboardData.js
import { useQuery, useQueryClient } from '@tanstack/react-query'

// API function terpisah untuk lebih bersih
const fetchDashboardData = async () => {
  const response = await window.api.dashboard.getData()

  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error || 'Failed to fetch dashboard data')
  }
}

// Custom hook menggunakan useQuery
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // Data dianggap stale setelah 5 menit
    gcTime: 1000 * 60 * 30, // Cache disimpan 30 menit
    refetchInterval: 15000, // Auto-refresh setiap 30 detik
    refetchIntervalInBackground: true, // Tetap refresh meski tab tidak aktif
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

// Optional: Hook untuk manual refetch
export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
}

// Fallback empty data structure
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
