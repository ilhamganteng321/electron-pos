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

  // ─── Build receipt HTML string ───────────────────────────────────────────
  const buildReceiptHTML = () => {
    const itemsHTML = (transaction.items || [])
      .map(
        (item) => `
      <div class="item-line">
        <div class="item-name">${item.product_name || `Produk #${item.product_id}`}</div>
        <div class="item-detail">
          <span class="item-qty">${item.qty} x ${fmt(item.price)}</span>
          <span class="item-subtotal">${fmt(item.subtotal)}</span>
        </div>
      </div>
    `
      )
      .join('')

    return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Struk Pembayaran</title>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 80mm;
    margin: 0 auto;
    padding: 8px 6px;
    font-family: 'Courier New', 'Lucida Sans Typewriter', monospace;
    font-size: 11px;
    line-height: 1.3;
    color: #000;
    background: #fff;
  }

  /* Header */
  .store-name {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }

  .thanks {
    text-align: center;
    font-size: 10px;
    margin-bottom: 8px;
    color: #333;
  }

  /* Divider */
  .divider {
    border-top: 1px dashed #000;
    margin: 6px 0;
  }

  .divider-double {
    border-top: 1px solid #000;
    margin: 6px 0;
  }

  /* Info Row */
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }

  .info-label {
    font-weight: normal;
  }

  .info-value {
    font-weight: normal;
  }

  /* Items */
  .item-line {
    margin-bottom: 8px;
  }

  .item-name {
    font-weight: bold;
    margin-bottom: 2px;
    text-transform: uppercase;
    font-size: 11px;
  }

  .item-detail {
    display: flex;
    justify-content: space-between;
    padding-left: 4px;
  }

  .item-qty {
    font-size: 10px;
  }

  .item-subtotal {
    font-weight: normal;
  }

  /* Summary */
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .summary-row.total {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #000;
    font-weight: bold;
    font-size: 12px;
  }

  .summary-row.return {
    font-weight: bold;
    font-size: 12px;
  }

  /* Footer */
  .footer {
    text-align: center;
    margin-top: 12px;
    font-size: 9px;
    color: #555;
  }

  .print-time {
    text-align: center;
    font-size: 9px;
    margin-top: 6px;
    color: #555;
  }

  /* Print optimization */
  @media print {
    body {
      margin: 0;
      padding: 8px 6px;
    }

    .no-print {
      display: none;
    }
  }
</style>
</head>

<body>
  <!-- Header -->
  <div class="store-name">TOKO POS</div>
  <div class="thanks">Terima kasih telah berbelanja</div>

  <div class="divider-double"></div>

  <!-- Transaction Info -->
  <div class="info-row">
    <span class="info-label">No</span>
    <span class="info-value">#${transaction.id || transaction.invoice_no || 'N/A'}</span>
  </div>

  <div class="info-row">
    <span class="info-label">Tanggal</span>
    <span class="info-value">${fmtDate(transaction.created_at)}</span>
  </div>

  <div class="divider"></div>

  <!-- Items List -->
  ${itemsHTML}

  <div class="divider"></div>

  <!-- Payment Summary -->
  <div class="summary-row">
    <span>Total</span>
    <span>${fmt(transaction.total)}</span>
  </div>

  <div class="summary-row">
    <span>Bayar</span>
    <span>${fmt(transaction.paid)}</span>
  </div>

  <div class="summary-row return">
    <span>Kembali</span>
    <span>${fmt(transaction.change)}</span>
  </div>

  <div class="divider-double"></div>

  <!-- Footer -->
  <div class="footer">
    Dicetak: ${new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })}
  </div>

  <script>
    // Auto print when window loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 200);
    };

    // Close window after print (optional)
    window.onafterprint = function() {
      setTimeout(function() {
        window.close();
      }, 500);
    };
  </script>
</body>
</html>
`
  }

  // ─── Open dedicated print window ────────────────────────────────────────
  const handlePrint = () => {
    const html = buildReceiptHTML()

    const blob = new Blob([html], {
      type: 'text/html'
    })

    const url = URL.createObjectURL(blob)

    const printWindow = window.open(
      url,
      '_blank',
      'width=450,height=700,menubar=no,toolbar=no,location=no'
    )

    if (!printWindow) {
      alert('Popup diblokir. Harap izinkan popup untuk mencetak struk.')
      return
    }

    printWindow.onload = () => {
      URL.revokeObjectURL(url)
    }
  }

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
            <DialogPanel className="w-full max-w-2xl bg-[#1a1a23] border border-white/8 rounded-2xl shadow-2xl max-h-[90vh] overflow-auto">
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
                    title="Cetak Struk"
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
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
