import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { Check, ChevronRight, Shield, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { parseCSV } from '@/utils/csvParser'
import { db, firebaseInitializationError, isFirebaseReady } from '@/services/firebase'

type Step = 1 | 2 | 3
type EmployeeImportMode = 'csv' | 'manual' | null

interface ManualEmployeeRow {
  firstName: string
  lastName: string
  email: string
  department: string
}

const roleOptions = [
  { value: '', label: 'Select your role' },
  { value: 'IT Manager', label: 'IT Manager' },
  { value: 'Business Owner', label: 'Business Owner' },
  { value: 'Compliance Officer', label: 'Compliance Officer' },
  { value: 'Other', label: 'Other' },
]

const emptyManualRow = (): ManualEmployeeRow => ({
  firstName: '',
  lastName: '',
  email: '',
  department: '',
})

function ProgressStep({ step, currentStep }: { step: Step; currentStep: Step }) {
  const isComplete = step < currentStep
  const isCurrent = step === currentStep

  return (
    <div className="flex flex-1 items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
          isComplete || isCurrent
            ? 'border-cyan bg-cyan text-navy'
            : 'border-white/[0.08] bg-white/[0.03] text-text-2'
        }`}
        data-testid={`onboarding-progress-step-${step}`}
      >
        {isComplete ? <Check className="h-4 w-4" /> : step}
      </div>
      {step < 3 && <div className={`h-px flex-1 ${isComplete ? 'bg-cyan/40' : 'bg-white/[0.08]'}`} />}
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, orgId, orgName } = useAuth()

  const defaultOrganizationName = useMemo(() => {
    const fallback = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ') ?? ''
    return orgName || fallback
  }, [orgName, user?.email])

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [organizationName, setOrganizationName] = useState(defaultOrganizationName)
  const [adminRole, setAdminRole] = useState('')
  const [employeeMode, setEmployeeMode] = useState<EmployeeImportMode>(null)
  const [csvRows, setCsvRows] = useState<Array<{ name: string; email: string; department: string }>>([])
  const [csvFileName, setCsvFileName] = useState('')
  const [manualRows, setManualRows] = useState<ManualEmployeeRow[]>([emptyManualRow()])
  const [employeesAddedCount, setEmployeesAddedCount] = useState(0)
  const [savingStep, setSavingStep] = useState<Step | null>(null)

  useEffect(() => {
    setOrganizationName((previous) => previous || defaultOrganizationName)
  }, [defaultOrganizationName])

  const csvPreviewRows = csvRows.slice(0, 3)

  const handleStepOneSubmit = async () => {
    if (!orgId || !isFirebaseReady) {
      toast.error(firebaseInitializationError || 'Firebase is not ready yet.')
      return
    }

    if (!organizationName.trim()) {
      toast.error('Organisation name is required.')
      return
    }

    if (!adminRole) {
      toast.error('Please choose your role.')
      return
    }

    setSavingStep(1)
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        name: organizationName.trim(),
        adminRole,
        onboardingStartedAt: serverTimestamp(),
      })
      setCurrentStep(2)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save onboarding details.')
    } finally {
      setSavingStep(null)
    }
  }

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const parsedRows = await parseCSV(file)
      setEmployeeMode('csv')
      setCsvRows(parsedRows)
      setCsvFileName(file.name)
      toast.success(`${parsedRows.length} employees ready to import.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to parse CSV file.')
    } finally {
      event.target.value = ''
    }
  }

  const updateManualRow = (index: number, field: keyof ManualEmployeeRow, value: string) => {
    setEmployeeMode('manual')
    setManualRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)))
  }

  const handleAddManualRow = () => {
    setEmployeeMode('manual')
    setManualRows((rows) => (rows.length >= 5 ? rows : [...rows, emptyManualRow()]))
  }

  const getManualEmployees = () => {
    const rowsWithContent = manualRows.filter((row) => row.firstName || row.lastName || row.email || row.department)

    const hasInvalidRow = rowsWithContent.some((row) => !row.firstName.trim() || !row.lastName.trim() || !row.email.trim())
    if (hasInvalidRow) {
      throw new Error('Please complete first name, last name, and email for each employee row.')
    }

    return rowsWithContent.map((row) => ({
      name: `${row.firstName.trim()} ${row.lastName.trim()}`.trim(),
      email: row.email.trim(),
      department: row.department.trim() || 'General',
    }))
  }

  const handleStepTwoSubmit = async () => {
    if (!orgId || !isFirebaseReady) {
      toast.error(firebaseInitializationError || 'Firebase is not ready yet.')
      return
    }

    let employeesToCreate: Array<{ name: string; email: string; department: string }> = []

    try {
      if (employeeMode === 'csv') {
        if (csvRows.length === 0) throw new Error('Upload a CSV file or skip this step.')
        employeesToCreate = csvRows
      }

      if (employeeMode === 'manual') {
        employeesToCreate = getManualEmployees()
        if (employeesToCreate.length === 0) throw new Error('Add at least one employee or skip this step.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to prepare employee data.')
      return
    }

    setSavingStep(2)
    try {
      if (employeesToCreate.length > 0) {
        const batch = writeBatch(db)

        employeesToCreate.forEach((employee) => {
          const employeeRef = doc(collection(db, 'employees'))
          batch.set(employeeRef, {
            orgId,
            name: employee.name,
            email: employee.email,
            department: employee.department,
            riskScore: 'low',
            clickCount: 0,
            lastClickDate: null,
            campaignsReceived: 0,
            trainingCompleted: 0,
            createdAt: serverTimestamp(),
          })
        })

        await batch.commit()
      }

      setEmployeesAddedCount(employeesToCreate.length)
      setCurrentStep(3)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add employees.')
    } finally {
      setSavingStep(null)
    }
  }

  const handleSkipEmployees = () => {
    setEmployeesAddedCount(0)
    setCurrentStep(3)
  }

  const handleFinish = async (destination: '/campaigns/create' | '/dashboard') => {
    if (!orgId || !isFirebaseReady) {
      toast.error(firebaseInitializationError || 'Firebase is not ready yet.')
      return
    }

    setSavingStep(3)
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        onboardingCompleted: true,
        onboardingCompletedAt: serverTimestamp(),
      })
      navigate(destination)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to complete onboarding.')
    } finally {
      setSavingStep(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-[760px] space-y-8">
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3" data-testid="onboarding-progress-indicator">
          <ProgressStep step={1} currentStep={currentStep} />
          <ProgressStep step={2} currentStep={currentStep} />
          <ProgressStep step={3} currentStep={currentStep} />
        </div>

        <Card className="mx-auto max-w-[560px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.8),rgba(10,17,31,0.94))] shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
          {currentStep === 1 && (
            <div className="space-y-6" data-testid="onboarding-step-1">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-cyan/20 bg-cyan/[0.08] shadow-[0_0_32px_rgba(0,212,255,0.16)]">
                  <Shield className="h-8 w-8 text-cyan" />
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text-1" data-testid="onboarding-step-1-title">Let&apos;s set up your security program</h1>
                <p className="mt-3 text-sm leading-7 text-text-2" data-testid="onboarding-step-1-subtitle">It takes 3 minutes. We&apos;ll help you launch your first phishing simulation.</p>
              </div>

              <div className="space-y-5">
                <Input
                  label="Organisation name"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="e.g. Linfy Tech Solutions"
                  data-testid="onboarding-organization-name-input"
                />
                <Select
                  label="Your role"
                  options={roleOptions}
                  value={adminRole}
                  onChange={(event) => setAdminRole(event.target.value)}
                  data-testid="onboarding-admin-role-select"
                />
              </div>

              <Button onClick={() => void handleStepOneSubmit()} loading={savingStep === 1} className="w-full" size="lg" data-testid="onboarding-step-1-continue-button">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6" data-testid="onboarding-step-2">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-text-1" data-testid="onboarding-step-2-title">Who should we protect first?</h2>
                <p className="mt-3 text-sm leading-7 text-text-2">Choose a quick import path, or add a few employees manually to get started.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-[24px] border p-5 ${employeeMode === 'csv' ? 'border-cyan bg-cyan/[0.08]' : 'border-white/[0.08] bg-white/[0.03]'}`} data-testid="onboarding-csv-option-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text-1">Import CSV</h3>
                      <p className="mt-1 text-sm text-text-2">Name, Email columns required</p>
                    </div>
                    <Upload className="h-5 w-5 text-cyan" />
                  </div>

                  <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-text-1 transition-colors hover:border-cyan/20 hover:bg-cyan/[0.08]" data-testid="onboarding-csv-upload-label">
                    Choose CSV file
                    <input type="file" accept=".csv" onChange={(event) => void handleCsvUpload(event)} className="hidden" data-testid="onboarding-csv-file-input" />
                  </label>

                  {csvFileName && (
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-text-2" data-testid="onboarding-csv-file-name">{csvFileName}</p>
                  )}

                  {csvPreviewRows.length > 0 && (
                    <div className="mt-4 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4" data-testid="onboarding-csv-preview">
                      <p className="text-xs uppercase tracking-[0.24em] text-text-2">Preview</p>
                      <div className="mt-3 space-y-3 text-sm text-text-2">
                        {csvPreviewRows.map((row, index) => (
                          <div key={`${row.email}-${index}`} className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-text-1">{row.name}</p>
                              <p>{row.email}</p>
                            </div>
                            <span>{row.department}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`rounded-[24px] border p-5 ${employeeMode === 'manual' ? 'border-cyan bg-cyan/[0.08]' : 'border-white/[0.08] bg-white/[0.03]'}`} data-testid="onboarding-manual-option-card">
                  <div>
                    <h3 className="text-lg font-semibold text-text-1">Add manually</h3>
                    <p className="mt-1 text-sm text-text-2">Add up to five employees during onboarding.</p>
                  </div>

                  <div className="mt-5 space-y-4">
                    {manualRows.map((row, index) => (
                      <div key={`manual-row-${index}`} className="rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
                        <div className="grid gap-3">
                          <Input value={row.firstName} onChange={(event) => updateManualRow(index, 'firstName', event.target.value)} placeholder="First Name" data-testid={`manual-first-name-${index}`} />
                          <Input value={row.lastName} onChange={(event) => updateManualRow(index, 'lastName', event.target.value)} placeholder="Last Name" data-testid={`manual-last-name-${index}`} />
                          <Input value={row.email} onChange={(event) => updateManualRow(index, 'email', event.target.value)} placeholder="Email" type="email" data-testid={`manual-email-${index}`} />
                          <Input value={row.department} onChange={(event) => updateManualRow(index, 'department', event.target.value)} placeholder="Department" data-testid={`manual-department-${index}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddManualRow}
                    disabled={manualRows.length >= 5}
                    className="mt-4 text-sm font-medium text-cyan transition-colors hover:text-cyan-dim disabled:cursor-not-allowed disabled:opacity-40"
                    data-testid="onboarding-add-manual-row-button"
                  >
                    + Add another
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={handleSkipEmployees} className="text-sm font-medium text-text-2 transition-colors hover:text-text-1" data-testid="onboarding-skip-employees-link">
                  Skip for now
                </button>
                <Button onClick={() => void handleStepTwoSubmit()} loading={savingStep === 2} size="lg" data-testid="onboarding-step-2-continue-button">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6" data-testid="onboarding-step-3">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-text-1" data-testid="onboarding-step-3-title">Your first campaign is ready.</h2>
                <p className="mt-3 text-sm leading-7 text-text-2">You&apos;ve got the essentials in place — now launch your first phishing simulation or head straight to the dashboard.</p>
              </div>

              <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-5" data-testid="onboarding-summary-card">
                <div className="space-y-4 text-sm text-text-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-text-1">Organisation</span>
                    <span className="font-medium text-text-1">{organizationName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-text-1">Employees added</span>
                    <span className="font-medium text-text-1">{employeesAddedCount > 0 ? employeesAddedCount : 'None — add later'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-text-1">First template ready</span>
                    <span className="font-medium text-text-1">SARS Tax Refund Notification</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void handleFinish('/campaigns/create')} loading={savingStep === 3} className="flex-1" size="lg" data-testid="onboarding-launch-campaign-button">
                  Launch my first campaign <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => void handleFinish('/dashboard')} className="flex-1" size="lg" data-testid="onboarding-go-dashboard-button">
                  Go to dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}