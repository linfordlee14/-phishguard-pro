import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useEmployees } from '@/hooks/useEmployees'
import { useFirestore } from '@/hooks/useFirestore'
import { api, generateAITemplate } from '@/services/api'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Select } from '@/components/ui/Select'
import { parseCSV } from '@/utils/csvParser'
import { Check, ChevronLeft, ChevronRight, Upload, Eye, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import type { Template, Employee, Campaign } from '@/types'

const difficultyVariant = { easy: 'success' as const, medium: 'warning' as const, hard: 'danger' as const }
const AI_EMAIL_PREVIEW_WRAPPER = (content: string) =>
  `<html><body style="font-family:Arial,sans-serif;padding:24px;font-size:14px;color:#333;max-width:600px">${content}</body></html>`

type AiTemplatePreview = {
  subject: string
  htmlContent: string
  redFlags: string[]
}

const difficultyStats: Record<'easy' | 'medium' | 'hard', { label: string; description: string; clickRate: string; tone: string }> = {
  easy: {
    label: 'Easy',
    description: 'Obvious tells — good for first-time training',
    clickRate: '~45%',
    tone: 'success',
  },
  medium: {
    label: 'Medium',
    description: 'Realistic — tests aware employees',
    clickRate: '~28%',
    tone: 'warning',
  },
  hard: {
    label: 'Hard',
    description: 'Near-perfect clone — for advanced teams',
    clickRate: '~15%',
    tone: 'danger',
  },
}

function buildSuspiciousSender(brand: string) {
  const normalized = brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  if (normalized.includes('fnb')) return 'fnb-security@fnb-verify.co.za'
  if (normalized.includes('sars')) return 'sars-alerts@sars-verification.co.za'
  if (normalized.includes('absa')) return 'absa-security@absa-verify.co.za'
  if (normalized.includes('nedbank')) return 'alerts@nedbank-secure.co.za'
  return `${normalized || 'security'}@${normalized || 'brand'}-verify.co.za`
}

export default function CampaignCreate() {
  const navigate = useNavigate()
  const { orgId, loading: authLoading } = useAuth()
  const { createCampaign } = useCampaigns()
  const { employees, loading: employeesLoading, bulkAddEmployees } = useEmployees()
  const { getAll: getTemplates, add: addTemplate } = useFirestore<Template>('templates')

  const [step, setStep] = useState(1)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiBrand, setAiBrand] = useState('')
  const [aiScenario, setAiScenario] = useState('')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [aiPreview, setAiPreview] = useState<AiTemplatePreview | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [analysisVisible, setAnalysisVisible] = useState(false)
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null)
  const newCardRef = useRef<HTMLDivElement | null>(null)
  const scrollHandledRef = useRef<string | null>(null)

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  // Step 2
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())

  // Step 3
  const [campaignName, setCampaignName] = useState('')
  const [sendDate, setSendDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))

  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    setLoading(true)

    getTemplates()
      .then((allTemplates) => {
        if (cancelled) return
        const visibleTemplates = allTemplates
          .filter((template) => !template.isCustom || template.orgId === orgId)
          .sort((a, b) => {
            const customDelta = Number(Boolean(b.isCustom)) - Number(Boolean(a.isCustom))
            if (customDelta !== 0) return customDelta
            const aTime = a.createdAt?.seconds || 0
            const bTime = b.createdAt?.seconds || 0
            return bTime - aTime
          })
        setTemplates(visibleTemplates)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setTemplates([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, orgId, getTemplates])

  useEffect(() => {
    if (selectedTemplate && step === 3 && !campaignName) {
      setCampaignName(`${selectedTemplate.name} — ${format(new Date(), 'MMM yyyy')}`)
    }
  }, [step, selectedTemplate])

  useEffect(() => {
    if (!scrollTargetId || scrollHandledRef.current === scrollTargetId) return
    if (!newCardRef.current) return
    newCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    scrollHandledRef.current = scrollTargetId
  }, [scrollTargetId, templates.length])

  useEffect(() => {
    setAnalysisVisible(false)
    if (!aiPreview) return
    const timer = window.setTimeout(() => setAnalysisVisible(true), 50)
    return () => window.clearTimeout(timer)
  }, [aiPreview])

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

  const handleGenerateAiTemplate = async () => {
    if (!orgId) {
      toast.error('Organization not ready yet')
      return
    }
    if (!aiBrand.trim() || !aiScenario.trim()) {
      toast.error('Brand and scenario are required')
      return
    }

    setAiGenerating(true)
    try {
      const result = await generateAITemplate(aiBrand.trim(), aiScenario.trim(), aiDifficulty)
      setAiPreview({
        subject: result?.subject || `${aiBrand.trim()} Security Notice`,
        htmlContent: result?.htmlContent || '<p>Preview unavailable.</p>',
        redFlags: result?.redFlags || [],
      })
      toast.success('Preview generated')
    } catch {
      toast.error('Generation failed — try again')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleUseAiTemplate = async () => {
    if (!orgId || !aiPreview) {
      toast.error('Generate a preview first')
      return
    }

    setAiGenerating(true)
    try {
      const templatePayload = {
        name: `${aiBrand.trim()} AI Template`,
        brand: aiBrand.trim(),
        difficulty: aiDifficulty,
        subject: aiPreview.subject,
        previewHtml: aiPreview.htmlContent,
        category: 'AI Generated',
        orgId,
        isCustom: true,
        htmlContent: aiPreview.htmlContent,
        redFlags: aiPreview.redFlags,
        createdAt: Timestamp.now(),
      } as Omit<Template, 'id'>

      const templateId = await addTemplate(templatePayload)
      const createdTemplate: Template = { id: templateId, ...templatePayload }
      setTemplates((prev) => [createdTemplate, ...prev.filter((t) => t.id !== templateId)])
      setSelectedTemplate(createdTemplate)
      setScrollTargetId(templateId)
      setAiModalOpen(false)
      toast.success('AI template added')
    } catch {
      toast.error('Generation failed — try again')
    } finally {
      setAiGenerating(false)
    }
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

  if (authLoading || loading || employeesLoading) {
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
                <div key={t.id} ref={t.id === scrollTargetId ? newCardRef : undefined}>
                  <Card
                    className={`cursor-pointer transition-all hover:border-cyan/50 ${selectedTemplate?.id === t.id ? 'border-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]' : ''}`}
                  >
                    <div onClick={() => setSelectedTemplate(t)}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-text-1">{t.name}</h3>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={difficultyVariant[t.difficulty]}>{t.difficulty}</Badge>
                          {t.isCustom && <Badge variant="info">AI Generated</Badge>}
                        </div>
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
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setAiModalOpen(true)}>
                <Sparkles className="h-4 w-4" /> Generate Custom Template (AI)
              </Button>
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

      {/* AI template generation modal */}
      <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)} title="Generate Custom Template" size="xl">
        <div className="space-y-5">
          <Card className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr_0.9fr_auto] gap-3 items-end">
              <Input
                label="Brand / Company Name"
                value={aiBrand}
                onChange={(e) => setAiBrand(e.target.value)}
                placeholder="e.g. FNB"
                disabled={aiGenerating}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-2">Scenario Description</label>
                <textarea
                  value={aiScenario}
                  onChange={(e) => setAiScenario(e.target.value)}
                  placeholder="e.g. employee receives fake invoice"
                  rows={3}
                  disabled={aiGenerating}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-input)] text-text-1 placeholder:text-text-2/50 transition-colors resize-none min-h-[44px]"
                />
              </div>
              <Select
                label="Difficulty"
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
                disabled={aiGenerating}
              />
              <Button onClick={() => void handleGenerateAiTemplate()} loading={aiGenerating} className="h-[44px]">
                Generate Preview
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green/80" />
                </div>
                <span className="ml-2 text-sm font-medium text-text-2">Inbox</span>
              </div>

              <div className="p-4 space-y-4">
                {aiPreview ? (
                  <>
                    <div className="space-y-2 rounded-lg border border-border bg-navy/35 p-3">
                      <div className="flex items-center justify-between gap-2 text-xs text-text-2">
                        <span>From</span>
                        <span className="font-mono-data text-cyan">{buildSuspiciousSender(aiBrand || 'FNB')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs text-text-2">
                        <span>Subject</span>
                        <span className="text-text-1">{aiPreview.subject}</span>
                      </div>
                    </div>

                    <iframe
                      title="AI email preview"
                      sandbox="allow-same-origin"
                      srcDoc={AI_EMAIL_PREVIEW_WRAPPER(aiPreview.htmlContent)}
                      className="h-[280px] w-full border-0 rounded-lg bg-white"
                    />
                  </>
                ) : (
                  <div className="flex h-[420px] items-center justify-center rounded-lg border border-dashed border-border bg-navy/20 text-center">
                    <div className="max-w-xs space-y-2">
                      <p className="text-sm font-medium text-text-1">Generate a preview to inspect the phishing email.</p>
                      <p className="text-sm text-text-2">Use the form above to create the email, then review it here before adding it to the template grid.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="space-y-5">
              <div>
                <div className="mb-3">
                  <Badge variant="danger" className="mb-2">🚩 Red Flags Detected</Badge>
                  {aiPreview ? (
                    <div className="space-y-2">
                      {aiPreview.redFlags.map((flag, index) => (
                        <div
                          key={`${flag}-${index}`}
                          className={`flex items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-1 transition-all duration-300 ${analysisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                          style={{ transitionDelay: `${index * 100}ms` }}
                        >
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-2">Run the generator to populate specific red flags for this scenario.</p>
                  )}
                </div>
              </div>

              <div>
                <Badge variant={difficultyVariant[aiDifficulty]} className="mb-2">📊 Difficulty Rating</Badge>
                <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm font-semibold text-text-1">{difficultyStats[aiDifficulty].label}</p>
                  <p className="text-sm text-text-2">{difficultyStats[aiDifficulty].description}</p>
                </div>
              </div>

              <div>
                <Badge variant="info" className="mb-2">⚡ Quick Stats</Badge>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm text-text-2 mb-1">Est. click rate for difficulty level</p>
                  <div className="flex items-end justify-between gap-3">
                    <p className={`text-3xl font-bold font-mono-data ${aiDifficulty === 'easy' ? 'text-green' : aiDifficulty === 'medium' ? 'text-amber' : 'text-red'}`}>
                      {difficultyStats[aiDifficulty].clickRate}
                    </p>
                    <p className="text-sm text-text-2 max-w-[180px] text-right">
                      {difficultyStats[aiDifficulty].tone === 'success'
                        ? 'Good for first-time training'
                        : difficultyStats[aiDifficulty].tone === 'warning'
                          ? 'Balances realism with training value'
                          : 'Best for advanced awareness programs'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Button variant="ghost" onClick={() => void handleGenerateAiTemplate()} loading={aiGenerating}>
              Regenerate
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setAiModalOpen(false)} disabled={aiGenerating}>
                Cancel
              </Button>
              <Button onClick={() => void handleUseAiTemplate()} disabled={!aiPreview || aiGenerating} className="bg-cyan text-navy hover:bg-cyan-dim">
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
