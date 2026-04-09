import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Navbar } from '@/components/layout/Navbar'
import { LineChart } from '@/components/charts/LineChart'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { getAIRiskNarrative } from '@/services/api'
import { getOrgRiskScore } from '@/utils/riskScore'
import { format } from 'date-fns'
import { Plus, TrendingDown, TrendingUp, ArrowRight, RefreshCw, ShieldAlert } from 'lucide-react'
import type { Campaign, Employee } from '@/types'

const RISK_NARRATIVE_CACHE_KEY = 'pg_risk_narrative'
const RISK_NARRATIVE_CACHE_TTL = 5 * 60 * 1000

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const riskBadgeVariant = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'success' as const,
}

function DashboardMetricCard({ label, value, detail, accent = 'text-cyan', trend }: { label: string; value: string | number; detail: string; accent?: string; trend?: ReactNode }) {
  return (
    <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.7),rgba(10,17,31,0.92))] shadow-[0_0_0_1px_rgba(0,212,255,0.08),0_20px_48px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-2">{label}</p>
          <p className={`mt-3 font-mono-data text-4xl font-semibold ${accent}`}>{value}</p>
        </div>
        {trend}
      </div>
      <p className="mt-3 text-sm text-text-2">{detail}</p>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { campaigns, loading: campaignsLoading } = useCampaigns()
  const { employees, loading: employeesLoading } = useEmployees()
  const [riskNarrative, setRiskNarrative] = useState('')
  const [riskLoading, setRiskLoading] = useState(true)
  const hasLoadedNarrativeRef = useRef(false)

  const loading = campaignsLoading || employeesLoading

  const completed = useMemo(() =>
    campaigns.filter((c: Campaign) => c.status === 'completed'),
    [campaigns]
  )

  const stats = useMemo(() => {
    const totalCampaigns = completed.length
    const totalClicked = completed.reduce((sum: number, c: Campaign) => sum + (c.stats?.clicked || 0), 0)
    const totalSent = completed.reduce((sum: number, c: Campaign) => sum + (c.stats?.sent || 0), 0)
    const avgClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0
    const trained = employees.filter((e: Employee) => e.trainingCompleted > 0).length
    const riskScore = getOrgRiskScore(avgClickRate)
    const trainingCoverage = employees.length > 0 ? Math.round((trained / employees.length) * 100) : 0
    const riskValue = clamp(Math.round(avgClickRate * 1.4 + (100 - trainingCoverage) * 0.35))
    return { totalCampaigns, avgClickRate, trained, riskScore, trainingCoverage, riskValue }
  }, [completed, employees])

  const chartData = useMemo(() => {
    return completed
      .sort((a: Campaign, b: Campaign) => a.scheduledAt?.seconds - b.scheduledAt?.seconds)
      .slice(-6)
      .map((c: Campaign) => ({
        name: c.scheduledAt ? format(c.scheduledAt.toDate(), 'MMM yyyy') : '',
        value: c.stats?.sent ? Math.round((c.stats.clicked / c.stats.sent) * 100) : 0,
      }))
  }, [completed])

  const isImproving = chartData.length >= 2 && chartData[chartData.length - 1].value < chartData[0].value

  const riskyEmployees = useMemo(() =>
    [...employees]
      .sort((a: Employee, b: Employee) => b.clickCount - a.clickCount)
      .slice(0, 5),
    [employees]
  )

  const recentCampaigns = useMemo(() =>
    [...campaigns]
      .sort((a: Campaign, b: Campaign) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 3),
    [campaigns]
  )

  const insightCampaigns = useMemo(() => campaigns.map((campaign: Campaign) => ({
    name: campaign.name,
    stats: campaign.stats,
  })), [campaigns])

  const insightEmployees = useMemo(() => employees.map((employee: Employee) => ({
    name: employee.name,
    department: employee.department,
    riskScore: employee.riskScore,
    clickCount: employee.clickCount,
    campaignsReceived: employee.campaignsReceived,
  })), [employees])

  const readCachedNarrative = () => {
    if (typeof window === 'undefined') return null
    const raw = sessionStorage.getItem(RISK_NARRATIVE_CACHE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as { narrative?: string; cachedAt?: number }
      if (!parsed.narrative || typeof parsed.cachedAt !== 'number') return null
      if (Date.now() - parsed.cachedAt >= RISK_NARRATIVE_CACHE_TTL) return null
      return parsed.narrative
    } catch {
      return null
    }
  }

  const writeCachedNarrative = (narrative: string) => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(
      RISK_NARRATIVE_CACHE_KEY,
      JSON.stringify({ narrative, cachedAt: Date.now() })
    )
  }

  const loadRiskNarrative = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = readCachedNarrative()
      if (cached) {
        setRiskNarrative(cached)
        setRiskLoading(false)
        return
      }
    }

    setRiskLoading(true)
    try {
      const response = await getAIRiskNarrative(insightCampaigns, insightEmployees)
      const narrative = response?.narrative || 'AI analysis temporarily unavailable. Please try again shortly.'
      setRiskNarrative(narrative)
      writeCachedNarrative(narrative)
    } catch {
      setRiskNarrative('AI analysis temporarily unavailable. Please try again shortly.')
    } finally {
      setRiskLoading(false)
    }
  }

  useEffect(() => {
    if (loading || hasLoadedNarrativeRef.current) return
    hasLoadedNarrativeRef.current = true
    void loadRiskNarrative(false)
  }, [loading, insightCampaigns, insightEmployees])

  if (loading) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
            <Skeleton variant="card" className="min-h-[360px]" />
            <div className="space-y-6">
              <Skeleton variant="card" className="min-h-[260px]" />
              <Skeleton variant="card" className="min-h-[180px]" />
            </div>
          </div>
          <Skeleton variant="table" rows={5} />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Dashboard">
        <Button onClick={() => navigate('/campaigns/create')} size="sm" data-testid="dashboard-new-campaign-button">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </Navbar>

      <div className="space-y-6 mt-6">
        <section className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(16,28,46,0.82),rgba(9,16,30,0.9))] px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan/[0.65]">Security posture</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-1">Operational risk at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-2">Monitor click behavior, campaign health, and high-risk employees from one premium control surface.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-text-2">
            {isImproving ? <TrendingDown className="h-4 w-4 text-green" /> : <TrendingUp className="h-4 w-4 text-red" />}
            <span data-testid="dashboard-trend-status">{isImproving ? 'Risk trend is improving' : 'Risk trend needs attention'}</span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetricCard label="Campaigns Run" value={stats.totalCampaigns} detail="Completed phishing simulations across your org." />
          <DashboardMetricCard
            label="Avg Click Rate"
            value={`${stats.avgClickRate}%`}
            accent={stats.avgClickRate >= 35 ? 'text-red' : stats.avgClickRate >= 15 ? 'text-amber' : 'text-cyan'}
            detail={isImproving ? 'Lower than your earliest recent campaign.' : 'Higher than your earliest recent campaign.'}
            trend={isImproving ? <TrendingDown className="h-5 w-5 text-green" /> : <TrendingUp className="h-5 w-5 text-red" />}
          />
          <DashboardMetricCard label="Employees Trained" value={stats.trained} accent="text-green" detail={`${employees.length || 0} employees currently tracked.`} />
          <DashboardMetricCard label="Training Coverage" value={`${stats.trainingCoverage}%`} detail={`Risk posture is ${stats.riskScore}.`} trend={<Badge variant={riskBadgeVariant[stats.riskScore]}>{stats.riskScore}</Badge>} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-1">Campaign Performance</h2>
                <p className="text-sm text-text-2">Six-campaign rolling click-rate trend in your org.</p>
              </div>
              <Badge variant={isImproving ? 'success' : 'warning'}>{isImproving ? 'Improving' : 'Watchlist'}</Badge>
            </div>
            {chartData.length > 0 ? (
              <LineChart data={chartData} yLabel="Click %" />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.03] text-text-2" data-testid="dashboard-empty-chart">
                No campaign data yet
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]">
              <RiskGauge value={stats.riskValue} />
              <div className="mt-4 flex items-center justify-between rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-text-2">Risk posture</p>
                  <p className="mt-1 text-sm text-text-1">{stats.riskScore === 'high' ? 'Immediate coaching advised.' : stats.riskScore === 'medium' ? 'Awareness program should continue.' : 'Current posture is stable.'}</p>
                </div>
                <Badge variant={riskBadgeVariant[stats.riskScore]}>{stats.riskScore}</Badge>
              </div>
            </Card>

            <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))] overflow-hidden" tint="blue">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Badge variant="info" className="gap-2 normal-case tracking-[0.12em]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  AI insight
                </Badge>
                <Button variant="secondary" size="sm" onClick={() => void loadRiskNarrative(true)} loading={riskLoading} data-testid="dashboard-refresh-insight-button">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              </div>
              {riskLoading ? (
                <Skeleton variant="text" rows={4} />
              ) : (
                <p className={`text-base leading-7 whitespace-pre-wrap ${riskNarrative.toLowerCase().includes('temporarily unavailable') ? 'text-amber' : 'text-text-2'}`} data-testid="dashboard-ai-insight">
                  {riskNarrative}
                </p>
              )}
            </Card>
          </div>
        </div>

        <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-1">Top Risky Employees</h2>
              <p className="text-sm text-text-2">Highest click exposure ranked by historic behavior.</p>
            </div>
            <Link to="/employees" className="flex items-center gap-1 text-xs text-cyan hover:text-cyan-dim" data-testid="dashboard-view-employees-link">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {riskyEmployees.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.03] px-6 py-12 text-center text-text-2" data-testid="dashboard-empty-risk-table">
              No employees yet
            </div>
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.03]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] gap-4 border-b border-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.22em] text-text-2 max-md:hidden">
                <span>Employee</span>
                <span>Department</span>
                <span>Last click</span>
                <span className="text-right">Risk</span>
              </div>
              <div data-testid="dashboard-risky-employees-table">
                {riskyEmployees.map((emp: Employee) => (
                  <div key={emp.id} className="grid gap-4 border-b border-white/[0.06] px-4 py-4 last:border-b-0 md:grid-cols-[1.6fr_1fr_1fr_0.8fr] md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan/[0.15] bg-cyan/10 text-sm font-semibold text-cyan">
                        {emp.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-1">{emp.name}</p>
                        <p className="text-xs text-text-2">{emp.clickCount} clicks recorded</p>
                      </div>
                    </div>
                    <div className="text-sm text-text-2">{emp.department}</div>
                    <div className="text-sm text-text-2">{emp.lastClickDate ? format(emp.lastClickDate.toDate(), 'dd MMM yyyy') : 'No click logged'}</div>
                    <div className="flex justify-start md:justify-end">
                      <Badge variant={riskBadgeVariant[emp.riskScore]}>{emp.riskScore}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-1">Recent Campaigns</h2>
            <Link to="/campaigns" className="text-xs text-cyan hover:text-cyan-dim flex items-center gap-1" data-testid="dashboard-view-campaigns-link">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {recentCampaigns.map((c: Campaign) => {
              const clickRate = c.stats?.sent ? Math.round((c.stats.clicked / c.stats.sent) * 100) : 0
              return (
                <div key={c.id} className="rounded-[22px] border border-white/[0.06] bg-white/[0.03] p-5">
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-1">{c.name}</p>
                      <Badge variant={clickRate > 40 ? 'danger' : clickRate > 20 ? 'warning' : 'success'}>{clickRate}% clicked</Badge>
                    </div>
                    <p className="text-xs text-text-2">
                      {c.sentAt ? format(c.sentAt.toDate(), 'dd MMM yyyy') : 'Not sent'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-text-2">{c.status}</p>
                  </div>
                </div>
              )
            })}
            {recentCampaigns.length === 0 && (
              <p className="text-sm text-text-2 text-center py-8 xl:col-span-3">No campaigns yet</p>
            )}
          </div>
        </Card>
      </div>

      <button
        onClick={() => navigate('/campaigns/create')}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-cyan bg-cyan text-navy shadow-[0_18px_40px_rgba(0,212,255,0.22)] transition-colors hover:bg-[#34ddff]"
        aria-label="New Campaign"
        data-testid="dashboard-floating-new-campaign-button"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  )
}
