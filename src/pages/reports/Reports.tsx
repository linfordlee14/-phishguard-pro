import { useState, useEffect, useMemo } from 'react'
import { useCampaigns } from '@/hooks/useCampaigns'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BarChart } from '@/components/charts/BarChart'
import { exportToPdf } from '@/utils/pdfExport'
import { format, subDays, isAfter } from 'date-fns'
import { Download, FileBarChart } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Campaign } from '@/types'

export default function Reports() {
  const { getCampaigns } = useCampaigns()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30')

  useEffect(() => {
    getCampaigns().then((c) => {
      setCampaigns(c)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (dateRange === 'all') return campaigns
    const cutoff = subDays(new Date(), Number(dateRange))
    return campaigns.filter((c) => c.sentAt && isAfter(c.sentAt.toDate(), cutoff))
  }, [campaigns, dateRange])

  const totalSent = filtered.reduce((s, c) => s + (c.stats?.sent || 0), 0)
  const totalClicked = filtered.reduce((s, c) => s + (c.stats?.clicked || 0), 0)
  const avgClickRate = totalSent ? Math.round((totalClicked / totalSent) * 100) : 0

  const chartData = filtered
    .filter((c) => c.sentAt)
    .sort((a, b) => a.sentAt!.toDate().getTime() - b.sentAt!.toDate().getTime())
    .map((c) => ({
      name: c.name.length > 20 ? c.name.slice(0, 18) + '…' : c.name,
      value: c.stats ? Math.round((c.stats.clicked / (c.stats.sent || 1)) * 100) : 0,
    }))

  const handleExportAll = async () => {
    try {
      await exportToPdf('reports-content', 'PhishGuard-Report')
      toast.success('Report exported')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleExportRow = async (camp: Campaign) => {
    try {
      await exportToPdf(`report-row-${camp.id}`, `${camp.name}-report`)
      toast.success('Exported')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <>
      <Navbar title="Reports">
        <Button size="sm" onClick={handleExportAll}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </Navbar>

      <div id="reports-content" className="mt-6 space-y-6">
        {/* Date range filter */}
        <div className="flex gap-2">
          {([['7', '7 Days'], ['30', '30 Days'], ['90', '90 Days'], ['all', 'All Time']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setDateRange(val)}
              className={`px-4 py-1.5 text-sm rounded-[var(--radius-btn)] border transition-colors ${dateRange === val ? 'bg-cyan text-navy border-cyan' : 'bg-surface text-text-2 border-border hover:text-text-1'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-text-2">Campaigns</p>
            <p className="text-2xl font-bold font-mono-data text-text-1">{filtered.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Total Sent</p>
            <p className="text-2xl font-bold font-mono-data text-text-1">{totalSent}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Total Clicked</p>
            <p className="text-2xl font-bold font-mono-data text-red">{totalClicked}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Avg Click Rate</p>
            <p className="text-2xl font-bold font-mono-data text-cyan">{avgClickRate}%</p>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <h3 className="font-semibold text-text-1 mb-4">Click Rate by Campaign</h3>
            <BarChart data={chartData} height={300} />
          </Card>
        )}

        {/* Campaign table */}
        <Card className="overflow-hidden">
          <h3 className="font-semibold text-text-1 mb-4 px-4 pt-4">Campaign Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-text-2 font-medium">Campaign</th>
                  <th className="p-3 text-left text-text-2 font-medium">Status</th>
                  <th className="p-3 text-left text-text-2 font-medium">Sent</th>
                  <th className="p-3 text-left text-text-2 font-medium">Clicked</th>
                  <th className="p-3 text-left text-text-2 font-medium">Reported</th>
                  <th className="p-3 text-left text-text-2 font-medium">Date</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="p-3"><div className="shimmer-block h-4 rounded-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-2">
                      <FileBarChart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                      No campaigns in this period
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} id={`report-row-${c.id}`} className="border-b border-border/50 hover:bg-surface/50">
                      <td className="p-3 text-text-1">{c.name}</td>
                      <td className="p-3">
                        <Badge variant={c.status === 'completed' ? 'success' : c.status === 'sent' ? 'info' : 'neutral'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono-data text-text-1">{c.stats?.sent || 0}</td>
                      <td className="p-3 font-mono-data text-red">{c.stats?.clicked || 0}</td>
                      <td className="p-3 font-mono-data text-green">{c.stats?.reported || 0}</td>
                      <td className="p-3 text-text-2">
                        {c.sentAt ? format(c.sentAt.toDate(), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleExportRow(c)} className="text-text-2 hover:text-cyan transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
