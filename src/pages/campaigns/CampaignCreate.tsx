import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { useFirestore } from '@/hooks/useFirestore'
import { api } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { parseCSV } from '@/utils/csvParser'
import { Check, ChevronLeft, ChevronRight, Upload, Eye } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { Template, Employee, Campaign } from '@/types'

const difficultyVariant = { easy: 'success' as const, medium: 'warning' as const, hard: 'danger' as const }

export default function CampaignCreate() {
  const navigate = useNavigate()
  const { orgId } = useAuth()
  const { createCampaign } = useCampaigns()
  const { employees, loading: employeesLoading, bulkAddEmployees } = useEmployees()
  const templateStore = useFirestore<Template>('templates')

  const [step, setStep] = useState(1)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // Step 2
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())

  // Step 3
  const [campaignName, setCampaignName] = useState('')
  const [sendDate, setSendDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))

  useEffect(() => {
    templateStore.getAll().then((t) => {
      setTemplates(t)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedTemplate && step === 3 && !campaignName) {
      setCampaignName(`${selectedTemplate.name} — ${format(new Date(), 'MMM yyyy')}`)
    }
  }, [step, selectedTemplate])

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseCSV(file)
      await bulkAddEmployees(parsed)
      toast.success(`Imported ${parsed.length} employees`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'CSV import failed')
    }
    e.target.value = ''
  }

  const handleLaunch = async () => {
    if (!orgId || !selectedTemplate) return
    setLaunching(true)
    try {
      const empIds = Array.from(selectedEmployeeIds)
      const campaignId = await createCampaign({
        orgId,
        name: campaignName,
        templateId: selectedTemplate.id,
        status: 'sent',
        targetEmployeeIds: empIds,
        scheduledAt: Timestamp.fromDate(new Date(sendDate)),
        sentAt: Timestamp.now(),
        completedAt: null,
        stats: { sent: empIds.length, opened: 0, clicked: 0, reported: 0, trainingCompleted: 0 },
        createdAt: Timestamp.now(),
      } as Omit<Campaign, 'id'>)

      try {
        await api.sendCampaign({
          campaignId,
          orgId,
          templateId: selectedTemplate.id,
          employeeIds: empIds,
        })
      } catch {
        // Backend may not be running; campaign is still created in Firestore
      }

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      toast.success('Campaign launched!')
      setTimeout(() => navigate('/campaigns'), 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Launch failed')
      setLaunching(false)
    }
  }

  const allSelected = employees.length > 0 && employees.every((e: Employee) => selectedEmployeeIds.has(e.id))
  const toggleAll = () => {
    if (allSelected) {
      setSelectedEmployeeIds(new Set())
    } else {
      setSelectedEmployeeIds(new Set(employees.map((e: Employee) => e.id)))
    }
  }
  const toggleOne = (id: string) => {
    const next = new Set(selectedEmployeeIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedEmployeeIds(next)
  }

  if (loading || employeesLoading) {
    return (
      <>
        <Navbar title="Create Campaign" />
        <div className="mt-6 space-y-4">
          <Skeleton variant="card" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar title="Create Campaign" />

      <div className="mt-6 space-y-6">
        {/* Progress stepper */}
        <div className="flex items-center gap-4">
          {[
            { n: 1, label: 'Choose Template' },
            { n: 2, label: 'Select Employees' },
            { n: 3, label: 'Schedule & Launch' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${step >= n ? 'bg-cyan text-navy' : 'bg-surface text-text-2'}`}>
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={`text-sm hidden sm:block ${step >= n ? 'text-text-1' : 'text-text-2'}`}>{label}</span>
              {n < 3 && <div className={`flex-1 h-0.5 ${step > n ? 'bg-cyan' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Template selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all hover:border-cyan/50 ${selectedTemplate?.id === t.id ? 'border-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]' : ''}`}
                >
                  <div onClick={() => setSelectedTemplate(t)}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-text-1">{t.name}</h3>
                      <Badge variant={difficultyVariant[t.difficulty]}>{t.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-text-2 mb-1">{t.brand}</p>
                    <p className="text-xs text-text-2">{t.category}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewTemplate(t)}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedTemplate?.id === t.id ? 'primary' : 'secondary'}
                      onClick={() => setSelectedTemplate(t)}
                    >
                      {selectedTemplate?.id === t.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedTemplate}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Employee selection */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-1">Select Employees</h3>
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-[var(--radius-btn)] text-text-2 hover:text-text-1 transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Import CSV
                    </span>
                  </label>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 w-10">
                          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-cyan" />
                        </th>
                        <th className="p-3 text-left text-text-2 font-medium">Name</th>
                        <th className="p-3 text-left text-text-2 font-medium">Email</th>
                        <th className="p-3 text-left text-text-2 font-medium">Department</th>
                        <th className="p-3 text-left text-text-2 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp: Employee) => (
                        <tr key={emp.id} className="border-b border-border/50 hover:bg-surface/50">
                          <td className="p-3">
                            <input type="checkbox" checked={selectedEmployeeIds.has(emp.id)} onChange={() => toggleOne(emp.id)} className="accent-cyan" />
                          </td>
                          <td className="p-3 text-text-1">{emp.name}</td>
                          <td className="p-3 text-text-2">{emp.email}</td>
                          <td className="p-3 text-text-2">{emp.department}</td>
                          <td className="p-3">
                            <Badge variant={emp.riskScore === 'high' ? 'danger' : emp.riskScore === 'medium' ? 'warning' : 'success'}>
                              {emp.riskScore}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <div>
              <div className="sticky top-24">
                <Card>
                  <h3 className="font-semibold text-text-1 mb-4">Campaign Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-2">Template</span>
                      <span className="text-text-1">{selectedTemplate?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-2">Employees</span>
                      <span className="text-text-1 font-mono-data">{selectedEmployeeIds.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-2">Difficulty</span>
                      <Badge variant={difficultyVariant[selectedTemplate?.difficulty || 'easy']}>
                        {selectedTemplate?.difficulty}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <div className="lg:col-span-3 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={selectedEmployeeIds.size === 0}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule & Launch */}
        {step === 3 && (
          <div className="max-w-xl mx-auto space-y-6">
            <Card>
              <h3 className="font-semibold text-text-1 mb-4">Campaign Details</h3>
              <div className="space-y-4">
                <Input
                  label="Campaign Name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                />
                <Input
                  label="Send Date & Time"
                  type="datetime-local"
                  value={sendDate}
                  onChange={(e) => setSendDate(e.target.value)}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-text-1 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-2">Template</span>
                  <span className="text-text-1">{selectedTemplate?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-2">Target Employees</span>
                  <span className="text-text-1 font-mono-data">{selectedEmployeeIds.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-2">Send Date</span>
                  <span className="text-text-1">{format(new Date(sendDate), 'dd MMM yyyy, HH:mm')}</span>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleLaunch} loading={launching} size="lg">
                Launch Campaign
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Template preview modal */}
      <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name || ''} size="lg">
        {previewTemplate && (
          <div>
            <p className="text-sm text-text-2 mb-3">Subject: {previewTemplate.subject}</p>
            <div
              className="bg-white rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: previewTemplate.previewHtml }}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
