// electron/ipc/dashboard.js
import { ipcMain } from 'electron'
import { getDb } from '../db.js'

ipcMain.handle('dashboard:getData', async () => {
  try {
    const db = getDb()

    // 1. Revenue Summary (today)
    const revenueSummary = await db.get(`
      SELECT
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of day')
    `)

    // 2. Weekly Revenue
    const weeklyRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-7 days')
    `)

    // 3. Monthly Revenue
    const monthlyRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of month')
    `)

    // 4. Total Products
    const totalProducts = await db.get(`
      SELECT COUNT(*) as total FROM products
    `)

    // 5. Low Stock Products (stock <= 5)
    const lowStockProducts = await db.all(`
      SELECT id, name, stock
      FROM products
      WHERE stock <= 5 AND stock > 0
      ORDER BY stock ASC
      LIMIT 10
    `)

    // 6. Out of Stock Products
    const outOfStockProducts = await db.all(`
      SELECT id, name, stock
      FROM products
      WHERE stock = 0
      LIMIT 10
    `)

    // 7. Top Selling Products (last 30 days)
    const topProducts = await db.all(`
      SELECT
        p.id,
        p.name,
        p.price,
        COUNT(ti.id) as sold_count,
        COALESCE(SUM(ti.qty), 0) as total_sold,
        COALESCE(SUM(ti.subtotal), 0) as total_revenue
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      LEFT JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.created_at >= strftime('%s', 'now', '-30 days') OR t.created_at IS NULL
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `)

    // 8. Recent Transactions
    const recentTransactionsRaw = await db.all(`
      SELECT
        t.id,
        t.total as amount,
        t.paid,
        t.change,
        t.created_at as date,
        CASE
          WHEN t.paid >= t.total THEN 'completed'
          ELSE 'pending'
        END as status,
        json_group_array(
          json_object(
            'product_id', ti.product_id,
            'qty', ti.qty,
            'price', ti.price
          )
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `)

    // Parse JSON items for recent transactions
    const recentTransactions = recentTransactionsRaw.map((trx) => {
      let items = []
      if (trx.items) {
        try {
          items = JSON.parse(trx.items)
          // Filter out null items (from LEFT JOIN)
          items = items.filter((item) => item.product_id !== null)
        } catch (e) {
          console.log(e)
          items = []
        }
      }
      return {
        ...trx,
        items: items,
        item_count: items.length
      }
    })

    // 9. Sales Data (last 12 months)
    const salesData = await db.all(`
      SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as transactions
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `)

    // 11. Daily Sales for Sparklines (last 12 days)
    const dailySales = await db.all(`
      SELECT
        strftime('%Y-%m-%d', datetime(created_at, 'unixepoch')) as day,
        COALESCE(SUM(total), 0) as revenue
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-12 days')
      GROUP BY day
      ORDER BY day ASC
    `)

    // 12. Total Customers (unique transactions count as proxy)
    const totalCustomers = await db.get(`
      SELECT COUNT(DISTINCT id) as total FROM transactions
    `)

    // 13. Revenue vs Expense (last 6 months)
    const revenueExpenseRaw = await db.all(`
      SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COALESCE(SUM(total), 0) as revenue
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `)

    // Get previous period revenues for growth calculation
    const previousMonthRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of month', '-1 month')
      AND created_at < strftime('%s', 'now', 'start of month')
    `)

    const previousWeekRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-14 days')
      AND created_at < strftime('%s', 'now', '-7 days')
    `)

    const previousDayRevenue = await db.get(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-2 days')
      AND created_at < strftime('%s', 'now', '-1 day')
    `)

    // Helper function for growth percentage
    const getGrowth = (current, previous) => {
      if (previous === 0) return '+100%'
      const growth = ((current - previous) / previous) * 100
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
    }

    // Format sales data for ECharts
    const salesChartData = {
      labels: salesData.map((d) => {
        if (!d.month) return 'N/A'
        const [year, month] = d.month.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', {
          month: 'short',
          year: '2-digit'
        })
      }),
      values: salesData.map((d) => d.revenue || 0)
    }

    // Format revenue vs expense (expense simulated as 40-60% of revenue)
    const revenueExpenseData = {
      labels: revenueExpenseRaw.map((d) => {
        if (!d.month) return 'N/A'
        const [year, month] = d.month.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', {
          month: 'short'
        })
      }),
      revenue: revenueExpenseRaw.map((d) => d.revenue || 0),
      expense: revenueExpenseRaw.map((d) =>
        Math.round((d.revenue || 0) * (0.4 + Math.random() * 0.2))
      )
    }

    // Format sparklines
    const sparklineRevenue = dailySales.map((d) => d.revenue || 0)

    // Simulated sparkline counts
    const sparklineCounts = sparklineRevenue.map((_, i) => 40 + Math.floor(Math.random() * 60))

    // Monthly target progress (example target: 150,000,000)
    const monthlyTarget = 150000000
    const currentMonthRevenue = monthlyRevenue?.total || 0
    const targetProgress = Math.min(Math.round((currentMonthRevenue / monthlyTarget) * 100), 100)

    // Build activities timeline
    const activities = []

    // Add recent transactions as activities
    recentTransactions.slice(0, 5).forEach((trx) => {
      activities.push({
        type: 'payment',
        title: 'New transaction completed',
        description: `Transaction #${trx.id} - Rp ${(trx.amount || 0).toLocaleString()}`,
        timestamp: (trx.date || Math.floor(Date.now() / 1000)) * 1000
      })
    })

    // Add stock alerts as activities
    lowStockProducts.slice(0, 3).forEach((product) => {
      if (product.stock > 0) {
        activities.push({
          type: 'stock',
          title: 'Low stock alert',
          description: `${product.name} has only ${product.stock} units left`,
          timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000
        })
      }
    })

    // Add out of stock alerts
    outOfStockProducts.slice(0, 3).forEach((product) => {
      activities.push({
        type: 'stock',
        title: 'Out of stock alert',
        description: `${product.name} is out of stock!`,
        timestamp: Date.now() - Math.random() * 48 * 60 * 60 * 1000
      })
    })

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp)

    return {
      success: true,
      data: {
        revenue: { total: revenueSummary?.total_revenue || 0 },
        transactions: { total: revenueSummary?.total_transactions || 0 },
        products: { total: totalProducts?.total || 0 },
        customers: { total: totalCustomers?.total || 0 },

        sparklines: {
          revenue: sparklineRevenue,
          transactions: sparklineCounts,
          products: [320, 325, 328, 330, 335, 338, 340, 342, 342, 342, 342, 342],
          customers: sparklineCounts.map((v) => Math.floor(v * 1.5))
        },

        salesData: salesChartData,

        revenueExpenseData: revenueExpenseData,

        topProducts: topProducts.map((p) => ({
          id: p.id,
          name: p.name || 'Unknown',
          category: 'General',
          sold: p.total_sold || 0,
          revenue: p.total_revenue || 0
        })),

        recentTransactions: recentTransactions.map((trx) => ({
          id: `INV-${trx.id}`,
          customer: 'Customer',
          date: new Date((trx.date || Date.now() / 1000) * 1000).toISOString(),
          amount: trx.amount || 0,
          paymentMethod: 'cash',
          status: trx.status || 'completed',
          items: trx.item_count || 0
        })),

        lowStockProducts: [
          ...outOfStockProducts.map((p) => ({ ...p, stock: 0 })),
          ...lowStockProducts.filter((p) => p.stock > 0)
        ].slice(0, 10),

        revenueSummary: {
          today: revenueSummary?.total_revenue || 0,
          todayGrowth: getGrowth(
            revenueSummary?.total_revenue || 0,
            previousDayRevenue?.total || 0
          ),
          week: weeklyRevenue?.total || 0,
          weekGrowth: getGrowth(weeklyRevenue?.total || 0, previousWeekRevenue?.total || 0),
          month: monthlyRevenue?.total || 0,
          monthGrowth: getGrowth(monthlyRevenue?.total || 0, previousMonthRevenue?.total || 0),
          target: monthlyTarget,
          progress: targetProgress
        },

        activities: activities.slice(0, 10).map((act) => ({
          ...act,
          timestamp: new Date(act.timestamp).toISOString()
        }))
      }
    }
  } catch (err) {
    console.error('Dashboard data error:', err)
    return { success: false, error: String(err) }
  }
})
