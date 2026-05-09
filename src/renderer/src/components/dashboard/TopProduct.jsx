import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

TopProducts.propTypes = {
  products: PropTypes.array
}

export function TopProducts({ products }) {
  const [sortBy, setSortBy] = useState('revenue')
  const [sortOrder, setSortOrder] = useState('desc')

  const sortedProducts = [...products].sort((a, b) => {
    const order = sortOrder === 'desc' ? -1 : 1
    if (sortBy === 'revenue') return (a.revenue - b.revenue) * order
    if (sortBy === 'sold') return (a.sold - b.sold) * order
    return 0
  })

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null
    return sortOrder === 'desc' ? (
      <ChevronDownIcon className="w-3 h-3" />
    ) : (
      <ChevronUpIcon className="w-3 h-3" />
    )
  }

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 text-white/40 text-xs font-medium">Product</th>
            <th className="text-left py-3 text-white/40 text-xs font-medium">Category</th>
            <th
              className="text-right py-3 text-white/40 text-xs font-medium cursor-pointer hover:text-white/60 transition-colors"
              onClick={() => handleSort('sold')}
            >
              <div className="flex items-center justify-end gap-1">
                Sold <SortIcon column="sold" />
              </div>
            </th>
            <th
              className="text-right py-3 text-white/40 text-xs font-medium cursor-pointer hover:text-white/60 transition-colors"
              onClick={() => handleSort('revenue')}
            >
              <div className="flex items-center justify-end gap-1">
                Revenue <SortIcon column="revenue" />
              </div>
            </th>
            <th className="text-right py-3 text-white/40 text-xs font-medium">Performance</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <span className="text-white/60 text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{product.name}</p>
                    <p className="text-white/30 text-xs">ID: #{product.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">
                  {product.category}
                </span>
              </td>
              <td className="py-3 text-right">
                <span className="text-white font-semibold">{product.sold}</span>
                <span className="text-white/40 text-xs ml-1">units</span>
              </td>
              <td className="py-3 text-right">
                <span className="text-emerald-400 font-semibold">{fmt(product.revenue)}</span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-blue-500 rounded-full"
                      style={{ width: `${(product.sold / sortedProducts[0].sold) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-xs">
                    {Math.round((product.sold / sortedProducts[0].sold) * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
