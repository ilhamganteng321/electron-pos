import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid'
import { SparklineChart } from './SparklineChart'

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  prefix = '',
  sparkline
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-500/5',
    blue: 'from-blue-500/20 to-blue-500/5',
    orange: 'from-orange-500/20 to-orange-500/5',
    violet: 'from-violet-500/20 to-violet-500/5'
  }

  const iconColors = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    violet: 'text-violet-400'
  }

  const formatValue = (val) => {
    if (prefix === 'Rp') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(val)
    }
    return val.toLocaleString()
  }

  return (
    <div className="group relative overflow-hidden bg-white/2backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-white/3 hover:border-white/10 transition-all duration-300">
      {/* linear Background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl bg-linear-to-br ${colorClasses[color]} flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${iconColors[color]}`} />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend === 'up' ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
            {change}
          </div>
        </div>

        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{title}</p>
        <p className="text-white text-2xl font-bold mb-3">{formatValue(value)}</p>

        {/* Mini Sparkline */}
        <div className="h-8">
          <SparklineChart data={sparkline} color={color} />
        </div>
      </div>
    </div>
  )
}
