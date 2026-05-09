import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XMarkIcon, CurrencyDollarIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

export function PaymentModal({ open, total, onClose, onConfirm, loading }) {
  const [paid, setPaid] = useState('')
  const [error, setError] = useState('')

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const handleConfirm = () => {
    const paidAmount = parseFloat(paid)
    if (isNaN(paidAmount) || paidAmount < total) {
      setError(`Pembayaran minimal ${fmt(total)}`)
      return
    }
    setError('')
    onConfirm(paidAmount)
  }

  const change = paid ? parseFloat(paid) - total : 0

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md bg-[#1a1a23] border border-white/8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-500/20 flex items-center justify-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <DialogTitle className="text-white font-bold text-sm">Pembayaran</DialogTitle>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Total Pembayaran</p>
                  <p className="text-white text-2xl font-bold">{fmt(total)}</p>
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                    Jumlah Dibayar
                  </label>
                  <input
                    type="number"
                    placeholder="Masukkan nominal pembayaran"
                    value={paid}
                    onChange={(e) => {
                      setPaid(e.target.value)
                      setError('')
                    }}
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                    autoFocus
                  />
                  {error && <p className="mt-1.5 text-rose-400 text-xs">{error}</p>}
                </div>

                {change > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-1">Kembalian</p>
                    <p className="text-emerald-400 text-xl font-bold">{fmt(change)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white hover:bg-white/5 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Konfirmasi Bayar'
                  )}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

PaymentModal.propTypes = {
  open: PropTypes.bool,
  total: PropTypes.number,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  loading: PropTypes.bool
}
