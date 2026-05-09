import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, ReceiptPercentIcon, PrinterIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

export function TransactionDetail({ open, transaction, onClose }) {
  if (!transaction) return null

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(n)

  const fmtDate = (ts) => {
    const date = new Date(ts * 1000)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // Tambahkan CSS global khusus print di sini
  const printStyles = (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @media print {

        html, body {
          background: black !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* sembunyikan backdrop dan tombol */
        .no-print {
          display: none !important;
        }

        /* hilangkan semua overlay/headless ui */
        [data-headlessui-state] {
          position: static !important;
          transform: none !important;
          inset: auto !important;
        }

        /* tampilkan area print */
        .print-area {
          display: block !important;
          position: static !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          overflow: visible !important;

          background: white !important;
          color: black !important;

          border: none !important;
          box-shadow: none !important;
        }

        .print-area * {
          color: black !important;
          background: transparent !important;
          border-color: #ddd !important;
          box-shadow: none !important;
        }

        /* sembunyikan backdrop */
        .fixed.inset-0.bg-black\\/70 {
          display: none !important;
        }

        button {
          display: none !important;
        }

        @page {
          size: auto;
          margin: 10mm;
        }
      }
    `
      }}
    />
  )

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {printStyles}
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
            <DialogPanel className="print-area w-full max-w-2xl bg-[#1a1a23] border border-white/8 rounded-2xl shadow-2xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-[#1a1a23] border-b border-white/6 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/30 border border-violet-500/20 flex items-center justify-center">
                    <ReceiptPercentIcon className="w-4 h-4 text-violet-400" />
                  </div>
                  <DialogTitle className="text-white font-bold text-sm">
                    Detail Transaksi #{transaction.id}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 no-print"
                  >
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Transaction Info */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">Tanggal</span>
                    <span className="text-white text-sm">{fmtDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 text-sm">ID Transaksi</span>
                    <span className="text-white text-sm font-mono">#{transaction.id}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
                    Items
                  </h4>
                  <div className="space-y-2">
                    {transaction.items?.map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-white font-medium">
                            {item.product_name || `Produk #${item.product_id}`}
                          </span>
                          <span className="text-white font-semibold">{fmt(item.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">
                            {item.qty} x {fmt(item.price)}
                          </span>
                          <span className="text-white/40">@ {fmt(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white">{fmt(transaction.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Pembayaran</span>
                    <span className="text-emerald-400">{fmt(transaction.paid)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white/80 font-semibold">Kembalian</span>
                    <span className="text-green-400 font-bold text-lg">
                      {fmt(transaction.change)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

TransactionDetail.propTypes = {
  open: PropTypes.bool,
  transaction: PropTypes.object,
  onClose: PropTypes.func
}
