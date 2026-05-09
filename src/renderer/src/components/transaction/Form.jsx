import { useState, useEffect } from 'react'
import { TrashIcon, ShoppingCartIcon, CreditCardIcon } from '@heroicons/react/24/outline'

import PropTypes from 'prop-types'
import { ProductSearch } from './Search'
import { CartItem } from './CartItem'
import { PaymentModal } from './Modal'

export function TransactionForm({ onSuccess }) {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await window.api.product.getAll()
      if (res.success) {
        setProducts(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const addToCart = (product, qty) => {
    const existingIndex = cart.findIndex((item) => item.product_id === product.id)

    if (existingIndex >= 0) {
      // Update existing item
      const newCart = [...cart]
      const newQty = newCart[existingIndex].qty + qty

      if (newQty > product.stock) {
        alert(`Stok tidak cukup. Tersedia: ${product.stock}`)
        return
      }

      newCart[existingIndex].qty = newQty
      newCart[existingIndex].subtotal = newCart[existingIndex].price * newQty
      setCart(newCart)
    } else {
      // Add new item
      if (qty > product.stock) {
        alert(`Stok tidak cukup. Tersedia: ${product.stock}`)
        return
      }

      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          qty: qty,
          subtotal: product.price * qty,
          stock: product.stock
        }
      ])
    }
  }

  const updateCartQty = (index, newQty) => {
    const item = cart[index]
    if (newQty <= 0) {
      removeFromCart(index)
      return
    }

    if (newQty > item.stock) {
      alert(`Stok tidak cukup. Tersedia: ${item.stock}`)
      return
    }

    const newCart = [...cart]
    newCart[index].qty = newQty
    newCart[index].subtotal = newCart[index].price * newQty
    setCart(newCart)
  }

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
  }

  const clearCart = () => {
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
      setCart([])
    }
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!')
      return
    }
    setPaymentModalOpen(true)
  }

  const processPayment = async (paid) => {
    setLoading(true)
    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          price: item.price
        })),
        paid: paid
      }

      const res = await window.api.transaction.add(payload)

      if (res.success) {
        setCart([])
        onSuccess()
        setPaymentModalOpen(false)
      } else {
        alert(res.error)
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Panel - Product Search */}
      <div className="flex-1 bg-white/3 border border-white/6 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/6">
          <h3 className="text-white font-semibold text-sm">Cari Produk</h3>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <ProductSearch products={products} onAddToCart={addToCart} />
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white/3 border border-white/6 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="w-4 h-4 text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Keranjang</h3>
            {cart.length > 0 && <span className="text-xs text-white/40">({cart.length} item)</span>}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
            >
              <TrashIcon className="w-3 h-3" />
              Kosongkan
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                onUpdateQty={(newQty) => updateCartQty(index, newQty)}
                onRemove={() => removeFromCart(index)}
              />
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-white/6 p-5 space-y-3">
            <div className="flex justify-between text-white">
              <span className="text-white/60">Total</span>
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(total)}
              </span>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCardIcon className="w-4 h-4" />
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        total={total}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={processPayment}
        loading={loading}
      />
    </div>
  )
}

TransactionForm.propTypes = {
  onSuccess: PropTypes.func
}
