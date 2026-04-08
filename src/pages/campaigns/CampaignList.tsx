import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Shield, Eye } from 'lucide-react'
import { format } from 'date-fns'
import type { Campaign } from '@/types'

const statusVariant = {
  draft: 'neutral' as const,
  scheduled: 'info' as const,
  sent: 'warning' as const,
  completed: 'success' as const,
}

export default function CampaignList() {
  const navigate = useNavigate()
  const { campaigns, loading } = useCampaigns()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return campaigns
    return campaigns.filter((c: Campaign) => c.status === statusFilter)
  }, [campaigns, statusFilter])

  if (loading) {
    return (
      <>
        <Navbar title="Campaigns" />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Campaigns">
        <Button onClick={() => navigate('/campaigns/create')} size="sm">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </Navbar>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <Select
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'sent', label: 'Sent' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <Shield className="h-16 w-16 text-text-2 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-text-1 mb-2">No campaigns yet</h3>
            <p className="text-text-2 mb-6">Launch your first simulation to test your team's awareness.</p>
            <Button onClick={() => navigate('/campaigns/create')}>
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c: Campaign) => {
              const clickRate = c.stats?.sent ? Math.round((c.stats.clicked / c.stats.sent) * 100) : 0
              return (
                <Card key={c.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-text-1">{c.name}</h3>
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-text-2">
                      {c.sentAt && <p>Sent: {format(c.sentAt.toDate(), 'dd MMM yyyy')}</p>}
                      <p>Targets: {c.targetEmployeeIds?.length || 0} employees</p>
                      {c.status === 'completed' && (
                        <p>Click rate: <span className={`font-mono-data ${clickRate > 40 ? 'text-red' : clickRate > 20 ? 'text-amber' : 'text-green'}`}>{clickRate}%</span></p>
                      )}
                    </div>
                  </div>
                  {c.status === 'completed' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4 self-start"
                      onClick={() => navigate(`/campaigns/${c.id}/results`)}
                    >
                      <Eye className="h-4 w-4" /> View Results
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
