import PropTypes from 'prop-types'

export function StockBadge({ stock }) {
  if (stock === 0)
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
        Habis
      </span>
    )
  if (stock <= 5)
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
        Menipis
      </span>
    )
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      Tersedia
    </span>
  )
}

StockBadge.propTypes = {
  stock: PropTypes.number
}
