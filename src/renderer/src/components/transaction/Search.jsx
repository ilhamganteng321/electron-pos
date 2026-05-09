import { useState } from 'react'
import { MagnifyingGlassIcon, PlusIcon, CubeIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

export function ProductSearch({ products, onAddToCart }) {
  const [search, setSearch] = useState('')
  const [quantities, setQuantities] = useState({})

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const getQuantity = (productId) => {
    return quantities[productId] || 1
  }

  const setQuantity = (productId, qty) => {
    if (qty < 1) qty = 1
    if (qty > products.find((p) => p.id === productId)?.stock) {
      qty = products.find((p) => p.id === productId)?.stock || 1
    }
    setQuantities((prev) => ({ ...prev, [productId]: qty }))
  }

  const handleAdd = (product) => {
    const qty = getQuantity(product.id)
    onAddToCart(product, qty)
    // Reset quantity to 1 after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-4 h-4 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/20 border border-white/6 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white/5 border border-white/6 rounded-xl p-3 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                <CubeIcon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                <p className="text-emerald-400 text-xs font-semibold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(product.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1 bg-black/30 rounded-lg">
                <button
                  onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                  className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
                >
                  -
                </button>
                <input
                  type="number"
                  value={getQuantity(product.id)}
                  onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                  className="w-12 text-center bg-transparent text-white text-sm outline-none"
                  min="1"
                  max={product.stock}
                />
                <button
                  onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                  className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleAdd(product)}
                disabled={product.stock === 0}
                className="px-2 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-3 h-3" />
                Tambah
              </button>
            </div>
            {product.stock <= 5 && (
              <p className="text-xs text-amber-400 mt-2">
                Stok: {product.stock} {product.stock === 0 && '(Habis)'}
              </p>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8">
            <p className="text-white/30 text-sm">Produk tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}

ProductSearch.propTypes = {
  products: PropTypes.array,
  onAddToCart: PropTypes.func
}
