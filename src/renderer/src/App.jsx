import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import Product from './pages/Product'
import Transaction from './pages/Transaction'
import Report from './pages/Report'
import SettingsBackupPage from './pages/Settings'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="product" element={<Product />} />
          <Route path="transaction" element={<Transaction />} />
          <Route path="report" element={<Report />} />
          <Route path="settings" element={<SettingsBackupPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
