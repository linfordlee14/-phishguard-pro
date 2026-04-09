import { useMemo, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { SecurityCopilot } from '@/components/SecurityCopilot'

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
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
      <main className="p-6 max-w-7xl mx-auto w-full">
        {children}
        <SecurityCopilot orgId={orgId} context={copilotContext} />
      </main>
    </ErrorBoundary>
  )
}
