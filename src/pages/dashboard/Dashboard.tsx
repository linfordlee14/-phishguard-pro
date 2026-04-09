import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Navbar } from '@/components/layout/Navbar'
import { LineChart } from '@/components/charts/LineChart'
import { getAIRiskNarrative } from '@/services/api'
import { getOrgRiskScore } from '@/utils/riskScore'
import { format } from 'date-fns'
import { Plus, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import type { Campaign, Employee } from '@/types'

const RISK_NARRATIVE_CACHE_KEY = 'pg_risk_narrative'
const RISK_NARRATIVE_CACHE_TTL = 5 * 60 * 1000

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
    return { totalCampaigns, avgClickRate, trained, riskScore }
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
          <Skeleton variant="card" />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Dashboard">
        <Button onClick={() => navigate('/campaigns/create')} size="sm">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </Navbar>

      <div className="space-y-6 mt-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card tint="blue">
            <p className="text-sm text-text-2 mb-1">Campaigns Run</p>
            <p className="text-3xl font-bold font-mono-data text-cyan">{stats.totalCampaigns}</p>
          </Card>
          <Card tint="red">
            <p className="text-sm text-text-2 mb-1">Avg Click Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold font-mono-data text-red">{stats.avgClickRate}%</p>
              {isImproving ? <TrendingDown className="h-5 w-5 text-green" /> : <TrendingUp className="h-5 w-5 text-red" />}
            </div>
          </Card>
          <Card tint="green">
            <p className="text-sm text-text-2 mb-1">Employees Trained</p>
            <p className="text-3xl font-bold font-mono-data text-green">{stats.trained}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2 mb-1">Risk Score</p>
            <Badge variant={stats.riskScore === 'high' ? 'danger' : stats.riskScore === 'medium' ? 'warning' : 'success'} className="text-base px-4 py-1">
              {stats.riskScore.toUpperCase()}
            </Badge>
          </Card>
        </div>

        <Card className="overflow-hidden" tint="blue">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Badge variant="info">🧠 AI Insight</Badge>
            <Button variant="secondary" size="sm" onClick={() => void loadRiskNarrative(true)} loading={riskLoading}>
              Refresh
            </Button>
          </div>
          {riskLoading ? (
            <Skeleton variant="text" rows={4} />
          ) : (
            <p className={`text-base leading-7 whitespace-pre-wrap ${riskNarrative.toLowerCase().includes('temporarily unavailable') ? 'text-amber' : 'text-text-2'}`}>
              {riskNarrative}
            </p>
          )}
        </Card>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-1">Campaign Performance</h2>
                <p className="text-sm text-text-2">
                  {isImproving ? '↓ Your team is improving' : '↑ Needs attention'}
                </p>
              </div>
            </div>
            {chartData.length > 0 ? (
              <LineChart data={chartData} yLabel="Click Rate %" />
            ) : (
              <div className="h-64 flex items-center justify-center text-text-2">
                No campaign data yet
              </div>
            )}
          </Card>

          {/* Risky employees */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-1">Top Risky Employees</h2>
              <Link to="/employees" className="text-xs text-cyan hover:text-cyan-dim flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {riskyEmployees.map((emp: Employee) => (
                <div key={emp.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-text-1">{emp.name}</p>
                    <p className="text-xs text-text-2">{emp.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono-data text-text-2">{emp.clickCount} clicks</span>
                    <Badge variant={emp.riskScore === 'high' ? 'danger' : emp.riskScore === 'medium' ? 'warning' : 'success'}>
                      {emp.riskScore}
                    </Badge>
                  </div>
                </div>
              ))}
              {riskyEmployees.length === 0 && (
                <p className="text-sm text-text-2 text-center py-4">No employees yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent campaigns */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-1">Recent Campaigns</h2>
            <Link to="/campaigns" className="text-xs text-cyan hover:text-cyan-dim flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentCampaigns.map((c: Campaign) => {
              const clickRate = c.stats?.sent ? Math.round((c.stats.clicked / c.stats.sent) * 100) : 0
              return (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-text-1">{c.name}</p>
                    <p className="text-xs text-text-2">
                      {c.sentAt ? format(c.sentAt.toDate(), 'dd MMM yyyy') : 'Not sent'}
                    </p>
                  </div>
                  <Badge variant={clickRate > 40 ? 'danger' : clickRate > 20 ? 'warning' : 'success'}>
                    {clickRate}% clicked
                  </Badge>
                </div>
              )
            })}
            {recentCampaigns.length === 0 && (
              <p className="text-sm text-text-2 text-center py-4">No campaigns yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/campaigns/create')}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-cyan text-navy flex items-center justify-center shadow-lg hover:bg-cyan-dim transition-colors z-50"
        aria-label="New Campaign"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  )
}
