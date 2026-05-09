// components/dashboard/Header.jsx

import { ArrowPathIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

Header.propTypes = {
  onRefresh: PropTypes.func,
  isLoading: PropTypes.bool
}

export function Header({ onRefresh, isLoading }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {getGreeting()}, John! 👋 Here's your business overview.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-white/5 transition-all group"
          >
            <ArrowPathIcon
              className={`w-5 h-5 text-white/60 group-hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
