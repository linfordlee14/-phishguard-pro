import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Plus, Shield, Eye, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import type { Campaign } from '@/types'

const statusVariant = {
  draft: 'neutral' as const,
  scheduled: 'info' as const,
  sent: 'warning' as const,
  completed: 'success' as const,
}

const statusLabel = {
  draft: 'Draft',
  scheduled: 'Active',
  sent: 'Active',
  completed: 'Completed',
}

const getClickRateColor = (rate: number) => {
  if (rate >= 40) return 'bg-red'
  if (rate >= 20) return 'bg-amber'
  return 'bg-cyan'
}

export default function CampaignList() {
  const navigate = useNavigate()
  const { campaigns, loading } = useCampaigns()
  const [statusFilter, setStatusFilter] = useState('all')

  const campaignStats = useMemo(() => ({
    active: campaigns.filter((campaign) => campaign.status === 'scheduled' || campaign.status === 'sent').length,
    completed: campaigns.filter((campaign) => campaign.status === 'completed').length,
    draft: campaigns.filter((campaign) => campaign.status === 'draft').length,
  }), [campaigns])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return campaigns
    return campaigns.filter((c: Campaign) => c.status === statusFilter)
  }, [campaigns, statusFilter])

  if (loading) {
    return (
      <>
        <Navbar title="Campaigns" />
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="min-h-[260px]" />)}
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Campaigns">
        <Button onClick={() => navigate('/campaigns/create')} size="sm" data-testid="campaigns-new-campaign-button">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </Navbar>

      <div className="mt-6 space-y-6">
        <section className="rounded-[28px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(16,28,46,0.82),rgba(9,16,30,0.9))] px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan/[0.65]">Simulation pipeline</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-1">Premium visibility across every phishing simulation</h2>
              <p className="mt-2 max-w-2xl text-sm text-text-2">Track launches, performance, and readiness in a card-based control center tuned for security teams.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-2">Active</p>
                <p className="mt-2 font-mono-data text-2xl font-semibold text-cyan">{campaignStats.active}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-2">Completed</p>
                <p className="mt-2 font-mono-data text-2xl font-semibold text-green">{campaignStats.completed}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-text-2">Draft</p>
                <p className="mt-2 font-mono-data text-2xl font-semibold text-text-1">{campaignStats.draft}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-4">
          <div>
            <p className="text-sm text-text-2">Showing <span className="font-mono-data text-text-1">{filtered.length}</span> campaigns</p>
            <p className="text-xs text-text-2">Filter your simulation pipeline without changing any existing campaign flows.</p>
          </div>
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
            className="w-full min-w-[220px] sm:w-60"
            data-testid="campaign-status-filter"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))] py-16 text-center">
            <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan/20 bg-cyan/[0.06] blur-md" style={{ animation: 'float-shield 3.4s ease-in-out infinite' }} />
              <div className="absolute inset-4 rounded-full border border-cyan/[0.12]" style={{ animation: 'float-shield 3.4s ease-in-out infinite', animationDelay: '0.2s' }} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-cyan/20 bg-cyan/10 shadow-[0_0_30px_rgba(0,212,255,0.16)]" style={{ animation: 'float-shield 3.4s ease-in-out infinite' }}>
                <Shield className="h-9 w-9 text-cyan" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-text-1">Launch your first simulation</h3>
            <p className="mx-auto mb-6 max-w-xl text-text-2">Build momentum with your first premium campaign card and start measuring click exposure across the team.</p>
            <Button onClick={() => navigate('/campaigns/create')} data-testid="campaigns-empty-create-button">
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filtered.map((c: Campaign) => {
              const clickRate = c.stats?.sent ? Math.round((c.stats.clicked / c.stats.sent) * 100) : 0
              const campaignDate = c.sentAt
                ? format(c.sentAt.toDate(), 'dd MMM yyyy')
                : c.scheduledAt
                  ? format(c.scheduledAt.toDate(), 'dd MMM yyyy')
                  : 'Not scheduled'

              return (
                <Card key={c.id} className="flex flex-col justify-between border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))] shadow-[0_22px_50px_rgba(0,0,0,0.24)]" data-testid={`campaign-card-${c.id}`}>
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-text-1">{c.name}</h3>
                        <p className="mt-2 text-sm text-text-2">{c.targetEmployeeIds?.length || 0} employees targeted in this simulation wave.</p>
                      </div>
                      <Badge variant={statusVariant[c.status]}>{statusLabel[c.status]}</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-text-2">Send date</p>
                        <p className="mt-2 font-mono-data text-lg text-text-1">{campaignDate}</p>
                      </div>
                      <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-text-2">Audience</p>
                        <p className="mt-2 font-mono-data text-lg text-text-1">{c.targetEmployeeIds?.length || 0}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/[0.06] bg-white/[0.03] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-text-2">Click rate</p>
                          <p className="mt-1 text-sm text-text-2">Security pressure based on observed clicks.</p>
                        </div>
                        <span className={`font-mono-data text-2xl font-semibold ${clickRate >= 40 ? 'text-red' : clickRate >= 20 ? 'text-amber' : 'text-cyan'}`} data-testid={`campaign-card-rate-${c.id}`}>
                          {clickRate}%
                        </span>
                      </div>
                      <ProgressBar value={clickRate} color={getClickRateColor(clickRate)} />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-text-2">{c.status === 'draft' ? 'Draft campaigns become active once scheduled.' : 'Open the results view to inspect employee outcomes.'}</p>
                    <Button
                      variant={c.status === 'draft' ? 'secondary' : 'primary'}
                      size="sm"
                      className="min-w-[150px]"
                      onClick={() => navigate(`/campaigns/${c.id}/results`)}
                      disabled={c.status === 'draft'}
                      data-testid={`campaign-view-results-${c.id}`}
                    >
                      <Eye className="h-4 w-4" /> View Results
                      {c.status !== 'draft' && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
