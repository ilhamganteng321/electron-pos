import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

LowStockAlert.propTypes = {
  products: PropTypes.array
}

export function LowStockAlert({ products }) {
  const navigate = useNavigate()
  const navigateToProduct = () => {
    navigate('/product')
  }
  const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0)
  const outOfStock = products.filter((p) => p.stock === 0)

  if (lowStockProducts.length === 0 && outOfStock.length === 0) {
    return (
      <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-white/40 text-sm">All stocks are healthy!</p>
      </div>
    )
  }

  return (
    <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <h3 className="text-white font-semibold">Low Stock Alert</h3>
        <span className="ml-auto text-xs text-white/40">
          {lowStockProducts.length + outOfStock.length} products
        </span>
      </div>

      <div className="space-y-3">
        {outOfStock.map((product) => (
          <div
            key={product.id}
            className="relative overflow-hidden rounded-xl bg-red-500/5 border border-red-500/20 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-red-400 text-xs">Out of Stock</p>
              </div>
              <span className="text-red-400 font-bold text-lg">0</span>
            </div>
            <div className="h-1 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-red-500 rounded-full" />
            </div>
          </div>
        ))}

        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="relative overflow-hidden rounded-xl bg-orange-500/5 border border-orange-500/20 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-orange-400 text-xs">{product.stock} units left</p>
              </div>
              <span className="text-orange-400 font-bold text-lg">{product.stock}</span>
            </div>
            <div className="h-1 bg-orange-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-orange-500 to-red-500 rounded-full"
                style={{ width: `${(product.stock / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={navigateToProduct}
        className="w-full mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all">
        View All Products
      </button>
    </div>
  )
}
