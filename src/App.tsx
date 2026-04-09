import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import LandingPage from '@/pages/landing/LandingPage'
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
import Settings from '@/pages/settings/Settings'

function AuthenticatedLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 max-md:ml-16 transition-all">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1E2F42', color: '#F0F4F8', border: '1px solid #2A3F55' },
            success: { iconTheme: { primary: '#2EC4B6', secondary: '#1E2F42' } },
            error: { iconTheme: { primary: '#E63946', secondary: '#1E2F42' } },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/training/:resultId" element={<TrainingModule />} />

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
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
