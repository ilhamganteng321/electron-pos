import {
  CheckCircleIcon,
  CubeIcon,
  PlusCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

ActivityTimeline.propTypes = {
  activities: PropTypes.array
}

export function ActivityTimeline({ activities }) {
  const navigate = useNavigate()
  const navigateToTransaction = () => {
    navigate('/transaction')
  }
  const getIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
      case 'stock':
        return <CubeIcon className="w-4 h-4 text-blue-400" />
      case 'product':
        return <PlusCircleIcon className="w-4 h-4 text-violet-400" />
      default:
        return <ExclamationCircleIcon className="w-4 h-4 text-orange-400" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-emerald-500/20'
      case 'stock':
        return 'bg-blue-500/20'
      case 'product':
        return 'bg-violet-500/20'
      default:
        return 'bg-orange-500/20'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="bg-white/2 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="group relative">
            <div className="flex items-start gap-3">
              {/* Timeline Line */}
              {idx !== activities.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-white/10 group-hover:bg-white/20 transition-colors" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-xl ${getActivityColor(activity.type)} flex items-center justify-center shrink-0`}
              >
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-medium">{activity.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{activity.description}</p>
                  </div>
                  <span className="text-white/30 text-xs shrink-0 whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={navigateToTransaction}
        className="w-full mt-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
      >
        View All Activities
      </button>
    </div>
  )
}
