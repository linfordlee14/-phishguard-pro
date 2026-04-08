import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { where } from 'firebase/firestore'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useFirestore } from '@/hooks/useFirestore'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { DonutChart } from '@/components/charts/DonutChart'
import { exportToPdf } from '@/utils/pdfExport'
import { format } from 'date-fns'
import { Download, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Campaign, CampaignResult, Employee } from '@/types'

export default function CampaignResults() {
  const { id } = useParams<{ id: string }>()
  const { getCampaign } = useCampaigns()
  const resultStore = useFirestore<CampaignResult>('campaignResults')
  const employeeStore = useFirestore<Employee>('employees')

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [results, setResults] = useState<CampaignResult[]>([])
  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getCampaign(id),
      resultStore.getAll([where('campaignId', '==', id)]),
    ]).then(async ([c, r]) => {
      setCampaign(c)
      setResults(r)
      // Fetch employee names
      const empIds = [...new Set(r.map((x) => x.employeeId))]
      const empMap = new Map<string, Employee>()
      for (const eid of empIds) {
        const emp = await employeeStore.getOne(eid)
        if (emp) empMap.set(eid, emp)
      }
      setEmployees(empMap)
      setLoading(false)
    })
  }, [id])

  const donutData = useMemo(() => {
    const clicked = results.filter((r) => r.outcome === 'clicked').length
    const reported = results.filter((r) => r.outcome === 'reported').length
    const ignored = results.filter((r) => r.outcome === 'ignored').length
    return [
      { name: 'Clicked', value: clicked, color: '#E63946' },
      { name: 'Reported', value: reported, color: '#2EC4B6' },
      { name: 'Ignored', value: ignored, color: '#8BA3BE' },
    ]
  }, [results])

  const handleExport = async () => {
    try {
      await exportToPdf('campaign-results', `${campaign?.name || 'report'}`)
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF export failed')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar title="Campaign Results" />
        <div className="mt-6 space-y-4">
          <Skeleton variant="card" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
        </div>
      </>
    )
  }

  if (!campaign) {
    return (
      <>
        <Navbar title="Campaign Results" />
        <Card className="mt-6 text-center py-12">
          <p className="text-text-2">Campaign not found</p>
        </Card>
      </>
    )
  }

  const stats = campaign.stats || { sent: 0, opened: 0, clicked: 0, reported: 0, trainingCompleted: 0 }

  return (
    <>
      <Navbar title={campaign.name}>
        <Button size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </Navbar>

      <div id="campaign-results" className="mt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Badge variant={campaign.status === 'completed' ? 'success' : 'info'}>{campaign.status}</Badge>
          {campaign.sentAt && (
            <span className="text-sm text-text-2">Sent: {format(campaign.sentAt.toDate(), 'dd MMM yyyy')}</span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {([
            { label: 'Sent', value: stats.sent, color: 'text-text-1' },
            { label: 'Opened', value: stats.opened, color: 'text-cyan' },
            { label: 'Clicked', value: stats.clicked, color: 'text-red' },
            { label: 'Reported', value: stats.reported, color: 'text-green' },
            { label: 'Training Done', value: stats.trainingCompleted, color: 'text-cyan' },
          ] as const).map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-text-2 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-mono-data ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-semibold text-text-1 mb-4">Outcome Distribution</h3>
            <DonutChart data={donutData} height={250} />
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-text-1 mb-4">Individual Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left text-text-2 font-medium">Name</th>
                    <th className="p-3 text-left text-text-2 font-medium">Outcome</th>
                    <th className="p-3 text-left text-text-2 font-medium">Training</th>
                    <th className="p-3 text-left text-text-2 font-medium">Risk Change</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const emp = employees.get(r.employeeId)
                    return (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-surface/50">
                        <td className="p-3 text-text-1">{emp?.name || 'Unknown'}</td>
                        <td className="p-3">
                          <Badge variant={r.outcome === 'clicked' ? 'danger' : r.outcome === 'reported' ? 'success' : 'neutral'}>
                            {r.outcome}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={r.trainingStatus === 'completed' ? 'success' : r.trainingStatus === 'pending' ? 'warning' : 'neutral'}>
                            {r.trainingStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {r.riskChange === 'higher' && <span className="flex items-center gap-1 text-red"><ArrowUpRight className="h-4 w-4" /> Higher</span>}
                          {r.riskChange === 'lower' && <span className="flex items-center gap-1 text-green"><ArrowDownRight className="h-4 w-4" /> Lower</span>}
                          {r.riskChange === 'same' && <span className="flex items-center gap-1 text-text-2"><Minus className="h-4 w-4" /> Same</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
