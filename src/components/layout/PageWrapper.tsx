import { useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { SecurityCopilot } from '@/components/SecurityCopilot'

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const location = useLocation()
  const { orgId } = useAuth()
  const { campaigns, loading: campaignsLoading } = useCampaigns()
  const { employees, loading: employeesLoading } = useEmployees()

  const copilotContext = useMemo<Record<string, unknown>>(() => {
    if (campaignsLoading || employeesLoading || !campaigns || !employees) {
      return {}
    }

    const completedCampaigns = campaigns.filter((campaign) => campaign.status === 'completed')
    const totalSent = completedCampaigns.reduce((sum, campaign) => sum + (campaign.stats?.sent || 0), 0)
    const totalClicked = completedCampaigns.reduce((sum, campaign) => sum + (campaign.stats?.clicked || 0), 0)
    const avgClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0
    const lastCampaign = [...campaigns]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0]?.name || 'none yet'

    return {
      avgClickRate,
      employeeCount: employees.length,
      lastCampaign,
    }
  }, [campaigns, campaignsLoading, employees, employeesLoading])

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div key={location.pathname} className="page-transition mx-auto w-full max-w-[1480px]">
          {children}
        </div>
        <SecurityCopilot orgId={orgId} context={copilotContext} />
      </main>
    </ErrorBoundary>
  )
}
