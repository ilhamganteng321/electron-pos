import { useState } from 'react'
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { SalesReport } from '../components/report/SalesReport'
import { ProductReport } from '../components/report/ProductReport'
import { InventoryReport } from '../components/report/InventoryReport'

export default function Report() {
  const [activeTab, setActiveTab] = useState('sales')

  const tabs = [
    { id: 'sales', label: 'Penjualan', icon: ChartBarIcon },
    { id: 'products', label: 'Produk Terlaris', icon: ArrowTrendingUpIcon },
    { id: 'inventory', label: 'Inventaris', icon: CubeIcon }
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Laporan</h1>
          <p className="text-white/40 text-sm mt-1">Analisis penjualan dan inventaris</p>
        </div>
        <div className="flex items-center gap-2">
          <DocumentChartBarIcon className="w-5 h-5 text-white/30" />
          <span className="text-white/40 text-xs">Data real-time</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/3 border border-white/6 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'products' && <ProductReport />}
        {activeTab === 'inventory' && <InventoryReport />}
      </div>
    </div>
  )
}
