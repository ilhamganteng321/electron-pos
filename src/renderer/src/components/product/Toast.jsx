import { Transition } from '@headlessui/react'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'
export function Toast({ msg, type, visible }) {
  if (!visible) return null
  return (
    <Transition
      show={visible}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-2 scale-95"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium
        ${
          type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300'
            : 'bg-rose-500/15 border border-rose-500/25 text-rose-300'
        }`}
      >
        {type === 'success' ? (
          <CheckCircleIcon className="w-4 h-4" />
        ) : (
          <ExclamationCircleIcon className="w-4 h-4" />
        )}
        {msg}
      </div>
    </Transition>
  )
}

Toast.propTypes = {
  msg: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  visible: PropTypes.bool
}
