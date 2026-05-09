// electron/ipc/transaction.js
import { ipcMain } from 'electron'
import db from '../db.js'

ipcMain.handle('dashboard:getData', async () => {
  try {
    // 1. Revenue Summary
    const revenueSummary = db
      .prepare(
        `
      SELECT
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of day')
    `
      )
      .get()

    // 2. Weekly Revenue
    const weeklyRevenue = db
      .prepare(
        `
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-7 days')
    `
      )
      .get()

    // 3. Monthly Revenue
    const monthlyRevenue = db
      .prepare(
        `
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of month')
    `
      )
      .get()

    // 4. Total Products
    const totalProducts = db
      .prepare(
        `
      SELECT COUNT(*) as total FROM products
    `
      )
      .get()

    // 5. Low Stock Products
    const lowStockProducts = db
      .prepare(
        `
      SELECT id, name, stock
      FROM products
      WHERE stock <= 5
      ORDER BY stock ASC
      LIMIT 10
    `
      )
      .all()

    // 6. Out of Stock Products
    const outOfStockProducts = db
      .prepare(
        `
      SELECT id, name, stock
      FROM products
      WHERE stock = 0
      LIMIT 10
    `
      )
      .all()

    // 7. Top Selling Products (last 30 days)
    const topProducts = db
      .prepare(
        `
      SELECT
        p.id,
        p.name,
        p.price,
        COUNT(ti.id) as sold_count,
        SUM(ti.qty) as total_sold,
        SUM(ti.subtotal) as total_revenue
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      LEFT JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.created_at >= strftime('%s', 'now', '-30 days') OR t.created_at IS NULL
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 10
    `
      )
      .all()

    // 8. Recent Transactions
    const recentTransactions = db
      .prepare(
        `
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
    `
      )
      .all()

    // Parse JSON items for recent transactions
    recentTransactions.forEach((trx) => {
      if (trx.items) {
        const items = JSON.parse(trx.items)
        // Filter out null items (from LEFT JOIN)
        trx.items = items.filter((item) => item.product_id !== null)
        trx.item_count = trx.items.length
      } else {
        trx.items = []
        trx.item_count = 0
      }
    })

    // 9. Sales Data (last 12 months)
    const salesData = db
      .prepare(
        `
      SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as transactions
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `
      )
      .all()

    // 10. Category Distribution
    const categoryDistribution = db
      .prepare(
        `
      SELECT
        CASE
          WHEN name LIKE '%Coffee%' OR name LIKE '%Kopi%' THEN 'Coffee'
          WHEN name LIKE '%Tea%' OR name LIKE '%Teh%' THEN 'Tea'
          WHEN name LIKE '%Croissant%' OR name LIKE '%Pastry%' THEN 'Pastry'
          WHEN name LIKE '%Latte%' OR name LIKE '%Matcha%' THEN 'Beverage'
          WHEN name LIKE '%Cheese%' OR name LIKE '%Cake%' THEN 'Dessert'
          ELSE 'Others'
        END as category,
        COUNT(*) as count
      FROM products
      GROUP BY category
    `
      )
      .all()

    // 11. Daily Sales for Sparklines (last 12 days)
    const dailySales = db
      .prepare(
        `
      SELECT
        strftime('%Y-%m-%d', datetime(created_at, 'unixepoch')) as day,
        COALESCE(SUM(total), 0) as revenue
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-12 days')
      GROUP BY day
      ORDER BY day ASC
    `
      )
      .all()

    // 12. Customer count (unique customers from transactions)
    // Note: This assumes you have customer_id or customer name in transactions
    // For now using transaction count as customer proxy
    const totalCustomers = db
      .prepare(
        `
      SELECT COUNT(DISTINCT id) as total FROM transactions
    `
      )
      .get()

    // 13. Revenue vs Expense (last 6 months)
    // Expense is simulated as 40-60% of revenue for demo
    const revenueExpense = db
      .prepare(
        `
      SELECT
        strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
        COALESCE(SUM(total), 0) as revenue
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `
      )
      .all()

    // Calculate growth percentages
    const getGrowth = (current, previous) => {
      if (previous === 0) return '+100%'
      const growth = ((current - previous) / previous) * 100
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
    }

    // Get previous month revenue for growth calculation
    const previousMonthRevenue = db
      .prepare(
        `
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of month', '-1 month')
      AND created_at < strftime('%s', 'now', 'start of month')
    `
      )
      .get()

    const previousWeekRevenue = db
      .prepare(
        `
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-14 days')
      AND created_at < strftime('%s', 'now', '-7 days')
    `
      )
      .get()

    const previousDayRevenue = db
      .prepare(
        `
      SELECT COALESCE(SUM(total), 0) as total
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', '-2 days')
      AND created_at < strftime('%s', 'now', '-1 day')
    `
      )
      .get()

    // Format sales data for ECharts
    const salesChartData = {
      labels: salesData.map((d) => {
        const [year, month] = d.month.split('-')
        return new Date(year, month - 1).toLocaleDateString('id-ID', {
          month: 'short',
          year: '2-digit'
        })
      }),
      values: salesData.map((d) => d.revenue)
    }

    // Format revenue vs expense
    const revenueExpenseData = {
      labels: revenueExpense.map((d) => {
        const [year, month] = d.month.split('-')
        return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'short' })
      }),
      revenue: revenueExpense.map((d) => d.revenue),
      expense: revenueExpense.map((d) => Math.round(d.revenue * (0.4 + Math.random() * 0.2))) // Simulated expense
    }

    // Format sparklines
    const sparklineRevenue = dailySales.map((d) => d.revenue)
    const sparklineCounts = dailySales.map((_, i) => 40 + Math.floor(Math.random() * 60))

    // Format category colors
    const categoryColors = {
      Coffee: '#10b981',
      Tea: '#3b82f6',
      Pastry: '#f59e0b',
      Beverage: '#8b5cf6',
      Dessert: '#ec4899',
      Others: '#6b7280'
    }

    const categoryData = categoryDistribution.map((cat) => ({
      name: cat.category,
      value: cat.count,
      color: categoryColors[cat.category] || '#6b7280'
    }))

    // Calculate monthly target progress (example target: 150,000,000)
    const monthlyTarget = 150000000
    const currentMonthRevenue = monthlyRevenue.total
    const targetProgress = Math.round((currentMonthRevenue / monthlyTarget) * 100)

    // Prepare activities timeline
    const activities = []

    // Add recent transactions as activities
    recentTransactions.slice(0, 5).forEach((trx) => {
      activities.push({
        type: 'payment',
        title: 'New transaction completed',
        description: `Transaction #${trx.id} - Rp ${trx.amount.toLocaleString()}`,
        timestamp: trx.date * 1000
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

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp)

    return {
      success: true,
      data: {
        revenue: { total: revenueSummary.total_revenue },
        transactions: { total: revenueSummary.total_transactions },
        products: { total: totalProducts.total },
        customers: { total: totalCustomers.total || 0 },

        sparklines: {
          revenue: sparklineRevenue,
          transactions: sparklineCounts,
          products: [320, 325, 328, 330, 335, 338, 340, 342, 342, 342, 342, 342], // Simulated
          customers: sparklineCounts.map((v) => Math.floor(v * 1.5))
        },

        salesData: salesChartData,

        revenueExpenseData: revenueExpenseData,

        topProducts: topProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: 'General', // You can add category column to products table
          sold: p.total_sold || 0,
          revenue: p.total_revenue || 0
        })),

        recentTransactions: recentTransactions.map((trx) => ({
          id: `INV-${trx.id}`,
          customer: 'Customer', // You can add customer name to transactions
          date: new Date(trx.date * 1000).toISOString(),
          amount: trx.amount,
          paymentMethod: 'cash', // You can add payment_method column
          status: trx.status,
          items: trx.item_count
        })),

        categoryData: categoryData,

        lowStockProducts: [
          ...outOfStockProducts.map((p) => ({ ...p, stock: 0 })),
          ...lowStockProducts.filter((p) => p.stock > 0).map((p) => ({ ...p, stock: p.stock }))
        ].slice(0, 10),

        revenueSummary: {
          today: revenueSummary.total_revenue,
          todayGrowth: getGrowth(revenueSummary.total_revenue, previousDayRevenue.total),
          week: weeklyRevenue.total,
          weekGrowth: getGrowth(weeklyRevenue.total, previousWeekRevenue.total),
          month: monthlyRevenue.total,
          monthGrowth: getGrowth(monthlyRevenue.total, previousMonthRevenue.total),
          target: monthlyTarget,
          progress: targetProgress
        },

        activities: activities.map((act) => ({
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
