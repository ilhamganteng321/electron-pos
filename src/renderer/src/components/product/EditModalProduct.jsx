import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Fragment, useState, useEffect } from 'react'
import { CubeIcon as CubeSolid } from '@heroicons/react/24/solid'
import PropTypes from 'prop-types'

export function EditProductModal({ open, onClose, onSuccess, productId }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch product data when modal opens with productId
  useEffect(() => {
    if (open && productId) {
      fetchProductData()
    }
  }, [open, productId])

  const fetchProductData = async () => {
    setFetchLoading(true)
    console.log('idnya', productId)
    try {
      const res = await window.api.product.getById(productId)
      console.log('hasilnya', res)
      if (res.success && res.data) {
        setForm({
          name: res.data.name,
          price: String(res.data.price),
          stock: String(res.data.stock)
        })
      } else {
        setErrors({ global: res.error || 'Gagal mengambil data produk' })
      }
    } catch (err) {
      setErrors({ global: String(err) })
    } finally {
      setFetchLoading(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Harga harus angka valid'
    if (form.stock !== '' && (isNaN(Number(form.stock)) || Number(form.stock) < 0))
      e.stock = 'Stok harus angka ≥ 0'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setLoading(true)
    try {
      const res = await window.api.product.update({
        id: productId,
        name: form.name.trim(),
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock)
      })
      if (res.success) {
        onSuccess('update', productId)
        handleClose()
      } else {
        setErrors({ global: res.error })
      }
    } catch (err) {
      setErrors({ global: String(err) })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await window.api.product.delete(productId)
      if (res.success) {
        onSuccess('delete', productId)
        handleClose()
      } else {
        setErrors({ global: res.error })
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setErrors({ global: String(err) })
      setShowDeleteConfirm(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleClose = () => {
    setForm({ name: '', price: '', stock: '' })
    setErrors({})
    setShowDeleteConfirm(false)
    onClose()
  }

  const field = (key, label, icon, placeholder, type = 'text') => (
    <div>
      <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => {
            setForm((p) => ({ ...p, [key]: e.target.value }))
            setErrors((p) => ({ ...p, [key]: undefined }))
          }}
          className={`w-full bg-white/4 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all
            ${errors[key] ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/8 focus:border-violet-500/50 focus:bg-white/[0.07]'}`}
        />
      </div>
      {errors[key] && (
        <p className="mt-1.5 text-rose-400 text-xs flex items-center gap-1">
          <ExclamationCircleIcon className="w-3.5 h-3.5" />
          {errors[key]}
        </p>
      )}
    </div>
  )

  // Delete Confirmation View
  if (showDeleteConfirm) {
    return (
      <Transition show={open} as={Fragment}>
        <Dialog onClose={handleClose} className="relative z-50">
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
              <DialogPanel className="w-full max-w-md bg-[#1a1a23] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/30 border border-rose-500/20 flex items-center justify-center">
                      <TrashIcon className="w-4 h-4 text-rose-400" />
                    </div>
                    <DialogTitle className="text-white font-bold text-sm">Hapus Produk</DialogTitle>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  <p className="text-white/70 text-sm">
                    Apakah Anda yakin ingin menghapus produk{' '}
                    <span className="text-white font-semibold">{form.name}</span>?
                  </p>
                  <p className="text-white/40 text-xs mt-2">Tindakan ini tidak dapat dibatalkan.</p>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> Menghapus...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-4 h-4" /> Hapus
                      </>
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

  // Edit Form View
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
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
            <DialogPanel className="w-full max-w-md bg-[#1a1a23] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 flex items-center justify-center">
                    <CubeSolid className="w-4 h-4 text-violet-400" />
                  </div>
                  <DialogTitle className="text-white font-bold text-sm">Edit Produk</DialogTitle>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {fetchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <ArrowPathIcon className="w-6 h-6 text-white/30 animate-spin" />
                  </div>
                ) : (
                  <>
                    {errors.global && (
                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-sm">
                        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                        {errors.global}
                      </div>
                    )}
                    {field(
                      'name',
                      'Nama Produk',
                      <CubeIcon className="w-4 h-4" />,
                      'Contoh: Kopi Arabika 250g'
                    )}
                    {field(
                      'price',
                      'Harga (Rp)',
                      <CurrencyDollarIcon className="w-4 h-4" />,
                      'Contoh: 45000',
                      'number'
                    )}
                    {field(
                      'stock',
                      'Stok',
                      <ArchiveBoxIcon className="w-4 h-4" />,
                      'Jumlah stok',
                      'number'
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-all flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Hapus
                </button>
                <div className="flex-1 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || fetchLoading}
                    className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4" /> Update
                      </>
                    )}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

EditProductModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  productId: PropTypes.number
}
