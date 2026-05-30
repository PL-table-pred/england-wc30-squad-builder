import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SiteFeaturesProvider } from './contexts/SiteFeaturesContext'
import { AdminLayout } from './components/admin/AdminLayout'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminBotsPage } from './pages/admin/AdminBotsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminReferencePage } from './pages/admin/AdminReferencePage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminPlayerPoolPage } from './pages/admin/AdminPlayerPoolPage'
import { MostPickedPage } from './pages/MostPickedPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { PrivacyPage } from './pages/PrivacyPage'

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location.pathname, location.hash])

  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/stats" element={<MostPickedPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="reference" element={<AdminReferencePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="players" element={<AdminPlayerPoolPage />} />
          <Route path="bots" element={<AdminBotsPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <SiteFeaturesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SiteFeaturesProvider>
    </AuthProvider>
  )
}

export default App
