// ShortcutMenu.jsx
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CommandLineIcon, ArrowPathIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

ShortcutMenu.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  navItems: PropTypes.array,
  onSelect: PropTypes.func
}
export function ShortcutMenu({ isOpen, onClose, navItems, onSelect }) {
  const shortcuts = [
    {
      category: 'Navigation',
      items: navItems.map((item, index) => ({
        name: item.name,
        shortcut: `Alt + ${index + 1}`,
        action: () => onSelect(index),
        icon: item.icon
      }))
    },
    {
      category: 'General',
      items: [
        {
          name: 'Open Shortcuts Menu',
          shortcut: '⌘ + K',
          action: null,
          description: 'Show this menu'
        },
        {
          name: 'Toggle Sidebar',
          shortcut: '⌘ + B',
          action: null,
          description: 'Collapse/Expand sidebar'
        },
        {
          name: 'Refresh Page',
          shortcut: '⌘ + R',
          action: null,
          description: 'Reload current page'
        },
        {
          name: 'Close Menu',
          shortcut: 'Esc',
          action: onClose,
          description: 'Close this dialog'
        }
      ]
    }
  ]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#16161d] border border-white/10 shadow-xl transition-all">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/20">
                      <ComputerDesktopIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-white">
                        Keyboard Shortcuts
                      </Dialog.Title>
                      <p className="text-sm text-white/50 mt-0.5">
                        Master your workflow with these keyboard shortcuts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <CommandLineIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {shortcuts.map((category, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            onClick={item.action || (() => {})}
                            className={`flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group ${
                              item.action ? 'cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && (
                                <item.icon className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-white/80 group-hover:text-white">
                                  {item.name}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-white/40 mt-0.5">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.shortcut.split(' + ').map((key, keyIdx) => (
                                <kbd
                                  key={keyIdx}
                                  className="px-2 py-1 text-xs font-mono font-bold bg-white/10 rounded-md text-white/60 group-hover:text-white/80 border border-white/5"
                                >
                                  {key.trim()}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                  <div className="flex items-center justify-center gap-4 text-xs text-white/30">
                    <div className="flex items-center gap-1">
                      <ArrowPathIcon className="w-3 h-3" />
                      <span>Pro tip: Use Alt + Number for quick navigation</span>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
