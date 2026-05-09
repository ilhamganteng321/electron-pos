import { ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

RevenueSummary.propTypes = {
  data: PropTypes.object
}

export function RevenueSummary({ data }) {
  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  return (
    <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-6">Revenue Summary</h3>

      <div className="space-y-4">
        {/* Today */}
        <div className="group relative overflow-hidden rounded-xl bg-linear-to-r from-white/5 to-transparent p-4 hover:from-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Today's Revenue</p>
                <p className="text-white text-2xl font-bold">{fmt(data.today)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {data.todayGrowth}
              </div>
              <p className="text-white/30 text-xs">vs yesterday</p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="group relative overflow-hidden rounded-xl bg-linear-to-r from-white/5 to-transparent p-4 hover:from-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs">This Week</p>
              <p className="text-white text-2xl font-bold">{fmt(data.week)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {data.weekGrowth}
              </div>
              <p className="text-white/30 text-xs">vs last week</p>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="group relative overflow-hidden rounded-xl bg-linear-to-r from-white/5 to-transparent p-4 hover:from-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs">This Month</p>
              <p className="text-white text-2xl font-bold">{fmt(data.month)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                {data.monthGrowth}
              </div>
              <p className="text-white/30 text-xs">vs last month</p>
            </div>
          </div>
        </div>

        {/* Target Progress */}
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/40">Monthly Target</span>
            <span className="text-white font-semibold">{data.progress}% achieved</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${data.progress}%` }}
            />
          </div>
          <p className="text-white/30 text-xs mt-2">
            Target: {fmt(data.target)} | Remaining: {fmt(data.target - data.month)}
          </p>
        </div>
      </div>
    </div>
  )
}
