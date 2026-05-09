import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

export function CartItem({ item, onUpdateQty, onRemove }) {
  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  return (
    <div className="bg-white/5 rounded-xl p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-white text-sm font-medium">{item.name}</p>
          <p className="text-emerald-400 text-xs">{fmt(item.price)}</p>
        </div>
        <button onClick={onRemove} className="text-red-400 hover:text-red-300 p-1">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 bg-black/30 rounded-lg">
          <button
            onClick={() => onUpdateQty(item.qty - 1)}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <span className="text-white text-sm w-8 text-center">{item.qty}</span>
          <button
            onClick={() => onUpdateQty(item.qty + 1)}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
        <p className="text-white font-semibold text-sm">{fmt(item.subtotal)}</p>
      </div>
    </div>
  )
}

CartItem.propTypes = {
  item: PropTypes.array,
  onUpdateQty: PropTypes.func,
  onRemove: PropTypes.func
}
