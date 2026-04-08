import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { where } from 'firebase/firestore'
import { useFirestore } from '@/hooks/useFirestore'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { format } from 'date-fns'
import { ArrowLeft, Mail, Building2, Shield } from 'lucide-react'
import type { Employee, CampaignResult, Campaign } from '@/types'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const empStore = useFirestore<Employee>('employees')
  const resultStore = useFirestore<CampaignResult>('campaignResults')
  const campStore = useFirestore<Campaign>('campaigns')

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [results, setResults] = useState<CampaignResult[]>([])
  const [campaigns, setCampaigns] = useState<Map<string, Campaign>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    empStore.getOne(id).then(async (emp) => {
      setEmployee(emp)
      if (emp) {
        const res = await resultStore.getAll([where('employeeId', '==', id)])
        setResults(res)
        const campMap = new Map<string, Campaign>()
        for (const r of res) {
          if (!campMap.has(r.campaignId)) {
            const c = await campStore.getOne(r.campaignId)
            if (c) campMap.set(r.campaignId, c)
          }
        }
        setCampaigns(campMap)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <>
        <Navbar title="Employee" />
        <div className="mt-6 space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="table" rows={3} />
        </div>
      </>
    )
  }

  if (!employee) {
    return (
      <>
        <Navbar title="Employee" />
        <Card className="mt-6 text-center py-12">
          <p className="text-text-2">Employee not found</p>
        </Card>
      </>
    )
  }

  return (
    <>
      <Navbar title={employee.name}>
        <Link to="/employees" className="flex items-center gap-1 text-sm text-text-2 hover:text-text-1 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Navbar>

      <div className="mt-6 space-y-6">
        {/* Profile card */}
        <Card>
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-2xl font-bold shrink-0">
              {employee.name[0]}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-text-1">{employee.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-text-2">
                <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {employee.email}</span>
                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {employee.department}</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Risk: <Badge variant={employee.riskScore === 'high' ? 'danger' : employee.riskScore === 'medium' ? 'warning' : 'success'}>{employee.riskScore}</Badge></span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-text-2">Campaigns</p>
            <p className="text-2xl font-bold font-mono-data text-text-1">{employee.campaignsReceived}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Clicks</p>
            <p className="text-2xl font-bold font-mono-data text-red">{employee.clickCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Training Done</p>
            <p className="text-2xl font-bold font-mono-data text-green">{employee.trainingCompleted}</p>
          </Card>
          <Card>
            <p className="text-sm text-text-2">Last Click</p>
            <p className="text-lg font-mono-data text-text-1">
              {employee.lastClickDate ? format(employee.lastClickDate.toDate(), 'dd MMM yyyy') : '—'}
            </p>
          </Card>
        </div>

        {/* Campaign history */}
        <Card>
          <h3 className="font-semibold text-text-1 mb-4">Campaign History</h3>
          {results.length === 0 ? (
            <p className="text-text-2 text-sm text-center py-4">No campaign history</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left text-text-2 font-medium">Campaign</th>
                    <th className="p-3 text-left text-text-2 font-medium">Outcome</th>
                    <th className="p-3 text-left text-text-2 font-medium">Training</th>
                    <th className="p-3 text-left text-text-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const camp = campaigns.get(r.campaignId)
                    return (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="p-3 text-text-1">{camp?.name || 'Unknown'}</td>
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
                        <td className="p-3 text-text-2">
                          {r.clickedAt ? format(r.clickedAt.toDate(), 'dd MMM yyyy') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
