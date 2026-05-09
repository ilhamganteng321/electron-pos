// SidebarContent.jsx
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
import { navItems } from '../../constant/layout'
import { ComputerDesktopIcon } from '@heroicons/react/24/solid'

export function SidebarContent({
  mobile = false,
  collapsed = false,
  selectedIndex = 0,
  setSelectedIndex,
  setMobileOpen
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-5 py-5 border-b border-white/10 ${collapsed && !mobile ? 'justify-center px-3' : ''}`}
      >
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
            <ComputerDesktopIcon className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <span className="text-white font-bold text-sm tracking-tight">Pos</span>
              <span className="block text-white/40 text-[10px] tracking-widest uppercase">
                Workspace
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item, i) => {
          const isActive = selectedIndex === i
          const Icon = isActive ? item.activeIcon : item.icon
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => {
                setSelectedIndex(i)
                if (mobile && setMobileOpen) setMobileOpen(false)
              }}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none w-full
                ${collapsed && !mobile ? 'justify-center px-2' : ''}
                ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-linear-to-b from-violet-400 to-fuchsia-400 rounded-full" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-all duration-200 ${isActive ? 'text-violet-400' : ''}`}
              />
              {(!collapsed || mobile) && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-white/50'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRightIcon className="w-3.5 h-3.5 text-white/30" />}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

SidebarContent.propTypes = {
  mobile: PropTypes.bool,
  collapsed: PropTypes.bool,
  selectedIndex: PropTypes.number,
  setSelectedIndex: PropTypes.number,
  setMobileOpen: PropTypes.bool
}
