// src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import {
  CloudArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  FolderOpenIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  ArrowUturnLeftIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'

export default function SettingsBackupPage() {
  const [loadingBackup, setLoadingBackup] = useState(false)
  const [loadingRestore, setLoadingRestore] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingVacuum, setLoadingVacuum] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [message, setMessage] = useState(null)
  const [dbInfo, setDbInfo] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [excelOptions, setExcelOptions] = useState({
    includeProducts: true,
    includeTransactions: true,
    includeTransactionItems: true,
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    loadDatabaseInfo()
  }, [])

  const loadDatabaseInfo = async () => {
    try {
      setLoadingInfo(true)
      const res = await window.api.database.getInfo()
      if (res.success) {
        setDbInfo(res.data)
      }
    } catch (err) {
      console.error('Failed to load database info:', err)
    } finally {
      setLoadingInfo(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleBackup = async () => {
    try {
      setLoadingBackup(true)
      const res = await window.api.database.backup()

      if (!res.success) {
        throw new Error(res.message || 'Backup gagal')
      }

      showMessage(res.message || 'Backup database berhasil disimpan')
      await loadDatabaseInfo()
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingBackup(false)
    }
  }

  const handleExportToExcel = async () => {
    try {
      setLoadingExcel(true)

      // Langsung kirim excelOptions karena struktur key-nya sudah sesuai
      // dengan yang diekspektasikan oleh ipcMain
      const res = await window.api.database.exportToExcel(excelOptions)

      if (!res.success) throw new Error(res.message || 'Export ke Excel gagal')

      showMessage(res.message || 'Data berhasil diexport ke Excel', 'success')
      setShowExcelModal(false)

      // Reset options
      setExcelOptions({
        includeProducts: true,
        includeTransactions: true,
        includeTransactionItems: true,
        dateFrom: '',
        dateTo: ''
      })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoadingExcel(false)
    }
  }

  const handleRestore = async () => {
    try {
      const confirmRestore = confirm(
        '⚠️ PERINGATAN!\n\nRestore database akan mengganti SELURUH data saat ini dengan data dari file backup.\n\nProses ini tidak dapat dibatalkan.\n\nLanjutkan?'
      )

      if (!confirmRestore) return

      setLoadingRestore(true)
      const res = await window.api.database.restore()

      if (!res.success) {
        throw new Error(res.message || 'Restore gagal')
      }

      showMessage(res.message || 'Restore database berhasil')
      await loadDatabaseInfo()

      setTimeout(() => {
        const confirmReload = confirm('Restore berhasil! Reload halaman untuk melihat perubahan?')
        if (confirmReload) {
          window.location.reload()
        }
      }, 1000)
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingRestore(false)
    }
  }

  const handleExportSQL = async () => {
    try {
      const confirmExport = confirm(
        'Export database ke SQL akan membuat file .sql yang berisi:\n\n' +
          '• Struktur semua tabel\n' +
          '• Semua data (produk, transaksi, dll)\n\n' +
          'File ini dapat digunakan untuk restore di aplikasi lain.\n\n' +
          'Lanjutkan?'
      )

      if (!confirmExport) return

      setLoadingExport(true)
      const res = await window.api.database.exportSql()

      if (!res.success) {
        throw new Error(res.message || 'Export gagal')
      }

      showMessage(res.message || 'Database berhasil diexport ke SQL', 'success')
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingExport(false)
    }
  }

  const handleResetDatabase = () => {
    setShowResetModal(true)
  }

  const handleConfirmReset = async () => {
    try {
      setLoadingReset(true)

      const res = await window.api.database.reset()

      if (!res.success) {
        throw new Error(res.message || 'Reset database gagal')
      }

      showMessage(res.message || 'Database berhasil direset', 'success')
      setShowResetModal(false)
      setConfirmText('')
      await loadDatabaseInfo()

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingReset(false)
    }
  }

  const handleVacuum = async () => {
    try {
      const confirmVacuum = confirm(
        'Optimalkan database akan mengecilkan ukuran file database.\n\nLanjutkan?'
      )

      if (!confirmVacuum) return

      setLoadingVacuum(true)
      const res = await window.api.database.vacuum()

      if (!res.success) {
        throw new Error(res.message || 'Optimasi gagal')
      }

      showMessage(
        res.message || `Database dioptimalkan: ${res.data?.savedSpaceFormatted} hemat`,
        'success'
      )

      await loadDatabaseInfo()
    } catch (err) {
      showMessage(err.message, 'error')
    } finally {
      setLoadingVacuum(false)
    }
  }

  const handleClearTransactions = async () => {
    try {
      const confirmClear = confirm(
        '⚠️ PERINGATAN!\n\nMenghapus semua data transaksi akan:\n' +
          '• Menghapus semua riwayat transaksi\n' +
          '• Menghapus semua item transaksi\n\n' +
          'Data produk akan tetap ada.\n\n' +
          'Lanjutkan?'
      )

      if (!confirmClear) return

      const res = await window.api.database.clearAllData()

      if (!res.success) {
        throw new Error(res.message || 'Gagal menghapus data')
      }

      showMessage(res.message, 'success')
      await loadDatabaseInfo()
    } catch (err) {
      showMessage(err.message, 'error')
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Backup & Restore Database</h1>
        <p className="text-sm text-white/40 mt-1">
          Kelola backup, restore, export, dan maintenance database aplikasi POS
        </p>
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

      {/* Excel Export Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TableCellsIcon className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Export ke Excel</h2>
            </div>

            <p className="text-white/70 text-sm mb-4">
              Pilih data yang ingin diexport ke file Excel (.xlsx)
            </p>

            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 text-white/80">
                <input
                  type="checkbox"
                  checked={excelOptions.includeProducts}
                  onChange={(e) =>
                    setExcelOptions({ ...excelOptions, includeProducts: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/20 bg-black/30"
                />
                <span>Data Produk</span>
              </label>

              <label className="flex items-center gap-3 text-white/80">
                <input
                  type="checkbox"
                  checked={excelOptions.includeTransactions}
                  onChange={(e) =>
                    setExcelOptions({ ...excelOptions, includeTransactions: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/20 bg-black/30"
                />
                <span>Data Transaksi</span>
              </label>

              <label className="flex items-center gap-3 text-white/80">
                <input
                  type="checkbox"
                  checked={excelOptions.includeTransactionItems}
                  onChange={(e) =>
                    setExcelOptions({ ...excelOptions, includeTransactionItems: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/20 bg-black/30"
                />
                <span>Detail Item Transaksi</span>
              </label>
            </div>

            <div className="border-t border-white/10 my-4"></div>

            <div className="space-y-3 mb-6">
              <p className="text-white/60 text-sm">Filter berdasarkan tanggal (opsional):</p>

              <div>
                <label className="text-white/60 text-sm block mb-1">Dari tanggal</label>
                <input
                  type="date"
                  value={excelOptions.dateFrom}
                  onChange={(e) => setExcelOptions({ ...excelOptions, dateFrom: e.target.value })}
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-1">Sampai tanggal</label>
                <input
                  type="date"
                  value={excelOptions.dateTo}
                  onChange={(e) => setExcelOptions({ ...excelOptions, dateTo: e.target.value })}
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowExcelModal(false)
                  setExcelOptions({
                    includeProducts: true,
                    includeTransactions: true,
                    includeTransactionItems: true,
                    dateFrom: '',
                    dateTo: ''
                  })
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white"
              >
                Batal
              </button>

              <button
                onClick={handleExportToExcel}
                disabled={
                  loadingExcel ||
                  (!excelOptions.includeProducts &&
                    !excelOptions.includeTransactions &&
                    !excelOptions.includeTransactionItems)
                }
                className="px-4 py-2 rounded-xl bg-green-600 text-white disabled:opacity-40 flex items-center gap-2"
              >
                {loadingExcel ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mengexport...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Reset Database</h2>

            <p className="text-white/70 text-sm mb-4">Semua data akan dihapus permanen.</p>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-white/80 mb-4">
              • Semua produk
              <br />
              • Semua transaksi
              <br />• Semua item transaksi
            </div>

            <p className="text-sm text-white/60 mb-2">
              Ketik <span className="font-bold text-red-400">RESET</span> untuk konfirmasi
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-white outline-none"
            />

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setConfirmText('')
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white"
              >
                Batal
              </button>

              <button
                disabled={confirmText !== 'RESET' || loadingReset}
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-red-600 text-white disabled:opacity-40"
              >
                {loadingReset ? 'Mereset...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Info Card */}
      {dbInfo && (
        <div className="mb-6 rounded-3xl border border-white/6 bg-white/3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Informasi Database</h3>
            <button
              onClick={loadDatabaseInfo}
              disabled={loadingInfo}
              className="text-white/40 hover:text-white/60 transition-colors text-sm"
            >
              {loadingInfo ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/40">Ukuran Database</p>
              <p className="text-white font-medium">
                {dbInfo.sizeFormatted || formatBytes(dbInfo.size)}
              </p>
            </div>
            <div>
              <p className="text-white/40">Total Produk</p>
              <p className="text-white font-medium">{dbInfo.tables?.products || 0}</p>
            </div>
            <div>
              <p className="text-white/40">Total Transaksi</p>
              <p className="text-white font-medium">{dbInfo.tables?.transactions || 0}</p>
            </div>
            <div>
              <p className="text-white/40">Item Terjual</p>
              <p className="text-white font-medium">{dbInfo.tables?.transaction_items || 0}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/6">
            <p className="text-white/30 text-xs">Lokasi: {dbInfo.path}</p>
            <p className="text-white/30 text-xs">
              Terakhir dimodifikasi:{' '}
              {dbInfo.modifiedAt ? new Date(dbInfo.modifiedAt).toLocaleString('id-ID') : '-'}
            </p>
          </div>
        </div>
      )}

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
                Simpan seluruh data transaksi, produk, dan pengaturan ke file backup (.db)
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
                Pulihkan database dari file backup (.db) sebelumnya
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-200 leading-relaxed">
                Restore akan mengganti SELURUH data saat ini dengan data dari file backup. Pastikan
                Anda memiliki backup terbaru sebelum melanjutkan.
              </p>
            </div>
          </div>

          <button
            onClick={handleRestore}
            disabled={loadingRestore}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRestore ? 'Memproses Restore...' : 'Restore Database'}
          </button>
        </div>

        {/* Export Excel Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <TableCellsIcon className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-white text-lg font-semibold">Export ke Excel</h2>
              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Export data ke file Excel (.xlsx) untuk analisis dan pelaporan
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <TableCellsIcon className="w-4 h-4 text-green-400" />
              Format Excel dengan multiple sheets
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <FolderOpenIcon className="w-4 h-4 text-green-400" />
              Bisa filter data berdasarkan tanggal
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              Pilih tabel yang ingin diexport
            </div>
          </div>

          <button
            onClick={() => setShowExcelModal(true)}
            className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-400 transition-all text-white font-medium"
          >
            Export ke Excel
          </button>
        </div>

        {/* Export SQL Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <DocumentArrowDownIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-white text-lg font-semibold">Export ke SQL</h2>
              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Export database ke file SQL untuk migrasi atau backup tambahan
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <DocumentArrowDownIcon className="w-4 h-4 text-blue-400" />
              File SQL dengan struktur dan data
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <FolderOpenIcon className="w-4 h-4 text-blue-400" />
              Bisa di-import ke database lain
            </div>
          </div>

          <button
            onClick={handleExportSQL}
            disabled={loadingExport}
            className="w-full h-12 rounded-2xl bg-blue-500 hover:bg-blue-400 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingExport ? 'Mengexport...' : 'Export ke SQL'}
          </button>
        </div>

        {/* Reset Database Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <ArrowUturnLeftIcon className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-white text-lg font-semibold">Reset Database</h2>
              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Reset semua data ke kondisi awal (bersih seperti baru)
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-200 leading-relaxed">
                Reset akan menghapus SEMUA data: produk, transaksi, dan item transaksi. Data TIDAK
                DAPAT dikembalikan!
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            disabled={loadingReset}
            className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-400 transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingReset ? 'Mereset Database...' : 'Reset Database'}
          </button>
        </div>

        {/* Maintenance Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-white text-lg font-semibold">Optimasi Database</h2>
              <p className="text-white/40 text-sm mt-1 leading-relaxed">
                Optimalkan ukuran database dan bersihkan data yang tidak terpakai
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVacuum}
              disabled={loadingVacuum}
              className="w-full h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-emerald-300 text-sm font-medium disabled:opacity-50"
            >
              {loadingVacuum ? 'Mengoptimalkan...' : 'Optimalkan Database (VACUUM)'}
            </button>

            <button
              onClick={handleClearTransactions}
              className="w-full h-10 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all text-yellow-300 text-sm font-medium"
            >
              <div className="flex items-center justify-center gap-2">
                <TrashIcon className="w-4 h-4" />
                Hapus Semua Data Transaksi
              </div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/6">
            <p className="text-white/30 text-xs text-center">
              Hapus transaksi akan menyimpan data produk
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/3 border border-white/6 rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-white/40 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">Tips Penting & Panduan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/50 leading-relaxed">
                <div>
                  <p className="text-white/70 mb-1">📦 Backup & Restore</p>
                  <p>
                    • Lakukan backup <strong className="text-white/70">setiap hari</strong> setelah
                    jam operasional
                  </p>
                  <p>
                    • Simpan file backup di <strong className="text-white/70">cloud storage</strong>{' '}
                    (Google Drive, OneDrive)
                  </p>
                  <p>
                    • Simpan minimal <strong className="text-white/70">7 hari terakhir</strong>{' '}
                    backup
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">📊 Export Excel</p>
                  <p>
                    • Export ke Excel untuk <strong className="text-white/70">analisis data</strong>
                  </p>
                  <p>
                    • Bisa pilih{' '}
                    <strong className="text-white/70">tabel yang ingin diexport</strong>
                  </p>
                  <p>
                    • Filter <strong className="text-white/70">berdasarkan tanggal</strong> untuk
                    laporan spesifik
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">📤 Export SQL</p>
                  <p>
                    • Export SQL untuk <strong className="text-white/70">migrasi database</strong>
                  </p>
                  <p>
                    • Bisa di-import ke{' '}
                    <strong className="text-white/70">phpMyAdmin, DBeaver, dll</strong>
                  </p>
                  <p>
                    • Format SQL <strong className="text-white/70">universal</strong> untuk berbagai
                    database
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-1">🔄 Reset & Maintenance</p>
                  <p>
                    • Reset hanya jika ingin{' '}
                    <strong className="text-white/70">memulai dari awal</strong>
                  </p>
                  <p>
                    • Lakukan VACUUM jika ukuran database{' '}
                    <strong className="text-white/70">50MB</strong>
                  </p>
                  <p>
                    • Hapus transaksi lama untuk{' '}
                    <strong className="text-white/70">menjaga performa</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
