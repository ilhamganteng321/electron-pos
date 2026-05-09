// Layout.jsx
import { useState, Fragment, useEffect } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLocation, Outlet } from 'react-router-dom'

import { navItems } from '../constant/layout'
import { SidebarContent } from '../components/layout/SidebarContent'

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Get active index based on current path
  const getActiveIndex = () => {
    const currentPath = location.pathname
    const index = navItems.findIndex((item) => item.path === currentPath)
    return index !== -1 ? index : 0
  }

  const [selectedIndex, setSelectedIndex] = useState(getActiveIndex())

  // Update selected index when path changes
  useEffect(() => {
    setSelectedIndex(getActiveIndex())
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-[#0f0f13] font-sans overflow-hidden">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-[#16161d] border-r border-white/6 transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-17' : 'w-56'}`}
      >
        <SidebarContent
          mobile={false}
          collapsed={collapsed}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          setMobileOpen={setMobileOpen}
        />
      </aside>

      {/* Mobile Sidebar Dialog */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-50 md:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 w-56 bg-[#16161d] border-r border-white/6 flex flex-col">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <SidebarContent
                mobile={true}
                collapsed={collapsed}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                setMobileOpen={setMobileOpen}
              />
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#0f0f13]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content - Children will be rendered here */}
        <div className="flex-1 overflow-y-auto">
          <Transition
            key={location.pathname}
            appear
            show
            enter="transition-all duration-300"
            enterFrom="opacity-0 translate-y-3"
            enterTo="opacity-100 translate-y-0"
          >
            <div className="px-6 py-6">
              <Outlet />
            </div>
          </Transition>
        </div>
      </main>
    </div>
  )
}
