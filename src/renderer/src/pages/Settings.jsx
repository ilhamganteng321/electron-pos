import { useState } from 'react'
import {
  CloudArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  FolderOpenIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function SettingsBackupPage() {
  const [loadingBackup, setLoadingBackup] = useState(false)
  const [loadingRestore, setLoadingRestore] = useState(false)
  const [message, setMessage] = useState(null)

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })

    setTimeout(() => {
      setMessage(null)
    }, 4000)
  }

  const handleBackup = async () => {
    try {
      setLoadingBackup(true)

      const res = await window.api.database.backup()

      if (!res.success) {
        throw new Error(res.message || 'Backup gagal')
      }

      showMessage('Backup database berhasil disimpan')
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingBackup(false)
    }
  }

  const handleRestore = async () => {
    try {
      const confirmRestore = confirm(
        'Restore database akan mengganti seluruh data saat ini. Lanjutkan?'
      )

      if (!confirmRestore) return

      setLoadingRestore(true)

      const res = await window.api.database.restore()

      if (!res.success) {
        throw new Error(res.message || 'Restore gagal')
      }

      showMessage('Restore database berhasil')

      // optional restart app
      // window.location.reload()
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingRestore(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Backup Database</h1>

        <p className="text-sm text-white/40 mt-1">Kelola backup dan restore data aplikasi POS</p>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
            message.type === 'error'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/20'
          }`}
        >
          {message.type === 'error' ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
          )}

          <div>
            <p
              className={`text-sm font-medium ${
                message.type === 'error' ? 'text-red-300' : 'text-emerald-300'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <CloudArrowDownIcon className="w-6 h-6 text-violet-400" />
              </div>

              <h2 className="text-white text-lg font-semibold">Backup Database</h2>

              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Simpan seluruh data transaksi, produk, dan pengaturan ke file backup.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <CircleStackIcon className="w-4 h-4 text-violet-400" />
              File database SQLite (.db)
            </div>

            <div className="flex items-center gap-3 text-sm text-white/60">
              <FolderOpenIcon className="w-4 h-4 text-violet-400" />
              Pilih lokasi penyimpanan backup
            </div>
          </div>

          <button
            onClick={handleBackup}
            disabled={loadingBackup}
            className="w-full h-12 rounded-2xl bg-violet-500 hover:bg-violet-400 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingBackup ? 'Memproses Backup...' : 'Backup Sekarang'}
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <ArrowPathRoundedSquareIcon className="w-6 h-6 text-amber-400" />
              </div>

              <h2 className="text-white text-lg font-semibold">Restore Database</h2>

              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Pulihkan database dari file backup sebelumnya.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200 leading-relaxed">
              Restore akan mengganti seluruh data saat ini dengan data dari file backup.
            </p>
          </div>

          <button
            onClick={handleRestore}
            disabled={loadingRestore}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRestore ? 'Memproses Restore...' : 'Restore Database'}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 rounded-3xl border border-white/6 bg-white/3 p-6">
        <h3 className="text-white font-semibold mb-3">Informasi Backup</h3>

        <div className="space-y-2 text-sm text-white/50 leading-relaxed">
          <p>• Backup menyimpan seluruh data aplikasi POS.</p>
          <p>• Simpan file backup di tempat yang aman.</p>
          <p>• Lakukan backup secara berkala untuk menghindari kehilangan data.</p>
          <p>• Restore database dapat mengganti seluruh data aplikasi saat ini.</p>
        </div>
      </div>
    </div>
  )
}
