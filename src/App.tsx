import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import LandingPage from '@/pages/landing/LandingPage'
import Onboarding from '@/pages/onboarding/Onboarding'
import Dashboard from '@/pages/dashboard/Dashboard'
import CampaignList from '@/pages/campaigns/CampaignList'
import CampaignCreate from '@/pages/campaigns/CampaignCreate'
import CampaignResults from '@/pages/campaigns/CampaignResults'
import EmployeeList from '@/pages/employees/EmployeeList'
import EmployeeDetail from '@/pages/employees/EmployeeDetail'
import TrainingOverview from '@/pages/training/TrainingOverview'
import TrainingModule from '@/pages/training/TrainingModule'
import Reports from '@/pages/reports/Reports'
import Billing from '@/pages/billing/Billing'
import BillingSuccess from '@/pages/billing/BillingSuccess'
import Settings from '@/pages/settings/Settings'

function AuthenticatedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const savedValue = window.localStorage.getItem('pg-sidebar-collapsed')
    if (savedValue !== null) return savedValue === 'true'
    return window.innerWidth < 1024
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('pg-sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="security-shell flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <div
        className="flex-1 transition-[margin] duration-300 max-md:!ml-16"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '220px' }}
      >
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(12, 22, 40, 0.92)',
              color: '#F0F4F8',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '18px',
              padding: '14px 16px',
              boxShadow: '0 18px 60px rgba(0, 0, 0, 0.34)',
              backdropFilter: 'blur(18px)',
            },
            success: { iconTheme: { primary: '#2EC4B6', secondary: '#0c1628' } },
            error: { iconTheme: { primary: '#E63946', secondary: '#0c1628' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/training/:resultId" element={<TrainingModule />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<AuthenticatedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<CampaignList />} />
              <Route path="/campaigns/create" element={<CampaignCreate />} />
              <Route path="/campaigns/:id/results" element={<CampaignResults />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/training" element={<TrainingOverview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
