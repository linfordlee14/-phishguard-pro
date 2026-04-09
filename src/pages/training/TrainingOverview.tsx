import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { where } from 'firebase/firestore'
import { Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useFirestore } from '@/hooks/useFirestore'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table } from '@/components/ui/Table'
import type { Campaign, CampaignResult, Employee } from '@/types'

type TrainingRow = {
  id: string
  employeeName: string
  department: string
  campaignName: string
  outcome: CampaignResult['outcome']
  trainingStatus: CampaignResult['trainingStatus']
  completedDate: string
  sortTimestamp: number
}

function timestampToMillis(value: { toDate: () => Date } | null | undefined) {
  return value ? value.toDate().getTime() : 0
}

export default function TrainingOverview() {
  const navigate = useNavigate()
  const { orgId, loading: authLoading } = useAuth()
  const { getAll: getTrainingResults } = useFirestore<CampaignResult>('campaignResults')
  const { getAll: getEmployees } = useFirestore<Employee>('employees')
  const { getAll: getCampaigns } = useFirestore<Campaign>('campaigns')

  const [rows, setRows] = useState<TrainingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!orgId) {
      setRows([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all([
      getTrainingResults([where('orgId', '==', orgId)]),
      getEmployees([where('orgId', '==', orgId)]),
      getCampaigns([where('orgId', '==', orgId)]),
    ])
      .then(([results, employees, campaigns]) => {
        if (cancelled) return

        const employeeMap = new Map(employees.map((employee) => [employee.id, employee]))
        const campaignMap = new Map(campaigns.map((campaign) => [campaign.id, campaign]))

        const nextRows = results
          .map((result) => {
            const employee = employeeMap.get(result.employeeId)
            const campaign = campaignMap.get(result.campaignId)
            const sortTimestamp = Math.max(
              timestampToMillis(result.trainingCompletedAt),
              timestampToMillis(result.clickedAt),
            )

            return {
              id: result.id,
              employeeName: employee?.name || 'Unknown employee',
              department: employee?.department || 'Unknown',
              campaignName: campaign?.name || 'Unknown campaign',
              outcome: result.outcome,
              trainingStatus: result.trainingStatus,
              completedDate: result.trainingCompletedAt
                ? format(result.trainingCompletedAt.toDate(), 'dd MMM yyyy')
                : '—',
              sortTimestamp,
            }
          })
          .sort((a, b) => b.sortTimestamp - a.sortTimestamp || a.employeeName.localeCompare(b.employeeName))

        setRows(nextRows)
      })
      .catch(() => {
        if (!cancelled) {
          setRows([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, orgId, getTrainingResults, getEmployees, getCampaigns])

  const stats = useMemo(() => {
    const assigned = rows.filter((row) => row.trainingStatus !== 'not_assigned').length
    const completed = rows.filter((row) => row.trainingStatus === 'completed').length
    const pending = rows.filter((row) => row.trainingStatus === 'pending').length
    const completionRate = assigned > 0 ? Number(((completed / assigned) * 100).toFixed(0)) : 0

    return {
      assigned,
      completed,
      pending,
      completionRate,
    }
  }, [rows])

  const columns = useMemo(() => [
    {
      key: 'employeeName',
      header: 'Employee Name',
      render: (row: TrainingRow) => <p className="font-medium text-text-1">{row.employeeName}</p>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (row: TrainingRow) => row.department,
    },
    {
      key: 'campaignName',
      header: 'Campaign',
      render: (row: TrainingRow) => row.campaignName,
    },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (row: TrainingRow) => (
        <Badge variant={row.outcome === 'clicked' ? 'danger' : row.outcome === 'reported' ? 'success' : 'neutral'}>
          {row.outcome}
        </Badge>
      ),
    },
    {
      key: 'trainingStatus',
      header: 'Training Status',
      render: (row: TrainingRow) => (
        <div className="flex flex-col gap-2">
          <Badge
            variant={
              row.trainingStatus === 'completed'
                ? 'success'
                : row.trainingStatus === 'pending'
                  ? 'warning'
                  : 'neutral'
            }
          >
            {row.trainingStatus.replace('_', ' ')}
          </Badge>
          {row.trainingStatus === 'pending' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success(`Reminder sent to ${row.employeeName}`)}
              className="self-start"
            >
              Send Reminder
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'completedDate',
      header: 'Completed Date',
      render: (row: TrainingRow) => row.completedDate,
    },
  ], [])

  if (authLoading || loading) {
    return (
      <>
        <Navbar title="Training Overview" />
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
          <Skeleton variant="table" rows={6} />
        </div>
      </>
    )
  }

  if (rows.length === 0) {
    return (
      <>
        <Navbar title="Training Overview" />
        <Card className="mt-6 text-center py-14">
          <Shield className="h-12 w-12 mx-auto text-cyan mb-4" />
          <h2 className="text-xl font-semibold text-text-1 mb-2">No training data yet. Launch your first campaign to get started.</h2>
          <p className="text-text-2 mb-6">Create your first campaign and completed training activity will appear here.</p>
          <Button onClick={() => navigate('/campaigns/create')}>
            Create Campaign
          </Button>
        </Card>
      </>
    )
  }

  return (
    <>
      <Navbar title="Training Overview" />

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card tint="blue">
            <p className="text-sm text-text-2 mb-1">Total Training Assigned</p>
            <p className="text-3xl font-bold font-mono-data text-cyan">{stats.assigned}</p>
          </Card>
          <Card tint="green">
            <p className="text-sm text-text-2 mb-1">Completed</p>
            <p className="text-3xl font-bold font-mono-data text-green">{stats.completed}</p>
          </Card>
          <Card tint="amber">
            <p className="text-sm text-text-2 mb-1">Pending</p>
            <p className="text-3xl font-bold font-mono-data text-amber">{stats.pending}</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="text-sm text-text-2">Completion Rate</p>
              <p className="text-2xl font-bold font-mono-data text-cyan">{stats.completionRate}%</p>
            </div>
            <ProgressBar value={stats.completionRate} max={100} color="bg-cyan" />
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-1">Training Activity</h2>
              <p className="text-sm text-text-2">Most recent activity appears first.</p>
            </div>
          </div>
          <Table
            columns={columns}
            data={rows}
            pageSize={rows.length || 1}
            getId={(row) => row.id}
          />
        </Card>
      </div>
    </>
  )
}
