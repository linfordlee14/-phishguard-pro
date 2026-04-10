import { useEffect, useMemo, useState } from 'react'
import { Check, CreditCard, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { useEmployees } from '@/hooks/useEmployees'
import { useFirestore } from '@/hooks/useFirestore'
import { createCheckout } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

type PlanId = 'starter' | 'pro' | 'business'

interface BillingOrg {
  id: string
  name: string
  plan?: PlanId
  seatsLimit?: number
  billingStatus?: 'active' | 'trialing' | 'inactive'
}

const PLAN_ORDER: PlanId[] = ['starter', 'pro', 'business']

const PLAN_DETAILS: Record<PlanId, { label: string; price: string; seats: number; features: string[]; featured?: boolean }> = {
  starter: {
    label: 'Starter',
    price: '399',
    seats: 10,
    features: [
      'Realistic phishing simulations',
      'Employee risk visibility',
      'Board-ready reporting',
      'Instant awareness training',
      'Monthly security workflow',
    ],
  },
  pro: {
    label: 'Pro',
    price: '749',
    seats: 25,
    featured: true,
    features: [
      'Everything in Starter',
      'AI-powered risk intelligence',
      'Premium dashboard analytics',
      'Security Copilot guidance',
      'Priority phishing operations',
    ],
  },
  business: {
    label: 'Business',
    price: '1499',
    seats: 100,
    features: [
      'Everything in Pro',
      'Larger seat capacity',
      'Multi-team reporting views',
      'Higher campaign scale',
      'Priority support for rollout',
    ],
  },
}

const planBadgeText: Record<PlanId, string> = {
  starter: 'Starter',
  pro: 'PRO',
  business: 'Business',
}

export default function Billing() {
  const { user, orgId } = useAuth()
  const { employees, loading: employeesLoading } = useEmployees()
  const organizationStore = useFirestore<BillingOrg>('organizations')
  const [organization, setOrganization] = useState<BillingOrg | null>(null)
  const [organizationLoading, setOrganizationLoading] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadOrganization() {
      if (!orgId) {
        if (isMounted) {
          setOrganization(null)
          setOrganizationLoading(false)
        }
        return
      }

      setOrganizationLoading(true)
      try {
        const org = await organizationStore.getOne(orgId)
        if (isMounted) setOrganization(org)
      } catch {
        if (isMounted) toast.error('Could not load billing details.')
      } finally {
        if (isMounted) setOrganizationLoading(false)
      }
    }

    void loadOrganization()
    return () => {
      isMounted = false
    }
  }, [orgId])

  const currentPlan = (organization?.plan ?? 'starter') as PlanId
  const currentPlanDetails = PLAN_DETAILS[currentPlan]
  const employeeCount = employees.length
  const seatLimit = organization?.seatsLimit ?? currentPlanDetails.seats ?? 10
  const usagePercentage = seatLimit > 0 ? Math.round((employeeCount / seatLimit) * 100) : 0

  const usageMessage = useMemo(() => {
    if (usagePercentage >= 100) {
      return { text: 'Seat limit reached — upgrade to add more', tone: 'text-red' }
    }
    if (usagePercentage >= 80) {
      return { text: 'Nearing seat limit', tone: 'text-amber' }
    }
    return null
  }, [usagePercentage])

  const handleUpgrade = async (planId: PlanId) => {
    if (!user?.uid || !user.email || !orgId) {
      toast.error('Billing details are not ready yet.')
      return
    }

    setLoadingPlan(planId)
    try {
      const { paymentUrl } = await createCheckout(planId, user.uid, user.email, orgId)
      window.location.href = paymentUrl
    } catch {
      toast.error('Could not initiate payment. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const isLoading = organizationLoading || employeesLoading

  return (
    <>
      <Navbar title="Billing" />

      <div className="mt-6 space-y-6">
        <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]" data-testid="billing-current-plan-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-text-2">Current Plan</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-4xl font-semibold tracking-tight text-text-1" data-testid="billing-current-plan-name">{currentPlanDetails.label}</h2>
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan" data-testid="billing-current-plan-badge">
                  {planBadgeText[currentPlan]}
                </span>
                <Badge variant={organization?.billingStatus === 'active' ? 'success' : 'warning'}>
                  {organization?.billingStatus === 'active' ? 'Active' : 'Free Trial'}
                </Badge>
              </div>
            </div>

            <div className="w-full max-w-[420px] space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm text-text-2">
                <span>{employeeCount} / {seatLimit} seats used</span>
                <span className="font-mono-data text-text-1">{usagePercentage}%</span>
              </div>
              <ProgressBar value={employeeCount} max={seatLimit} color={usagePercentage >= 100 ? 'bg-red' : usagePercentage >= 80 ? 'bg-amber' : 'bg-cyan'} />
              {usageMessage && <p className={`text-sm font-medium ${usageMessage.tone}`} data-testid="billing-seat-warning">{usageMessage.text}</p>}
            </div>
          </div>

          {isLoading && <div className="mt-4 shimmer-block h-4 w-48 rounded-full" />}
        </Card>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const plan = PLAN_DETAILS[planId]
            const isCurrentPlan = planId === currentPlan
            const actionText = isCurrentPlan ? 'Current Plan' : currentPlan === 'starter' && planId !== 'starter' ? `Upgrade to ${plan.label}` : `Switch to ${plan.label}`

            return (
              <Card
                key={planId}
                className={`flex flex-col justify-between border ${plan.featured ? 'border-cyan/[0.18] shadow-[0_0_0_1px_rgba(0,212,255,0.08),0_20px_48px_rgba(0,0,0,0.28),0_0_36px_rgba(0,212,255,0.12)]' : 'border-white/[0.06]'} bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]`}
                data-testid={`billing-plan-card-${planId}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-text-1">{plan.label}</h3>
                      <p className="mt-2 text-sm text-text-2">{plan.seats} employee seats</p>
                    </div>
                    {plan.featured && <Badge variant="info">Most Popular</Badge>}
                  </div>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-mono-data text-5xl font-semibold text-text-1">R{plan.price}</span>
                    <span className="pb-1 text-sm text-text-2">/mo</span>
                  </div>

                  <div className="my-6 h-px bg-white/[0.06]" />

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-text-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isCurrentPlan ? 'secondary' : 'primary'}
                  className="mt-8 w-full"
                  disabled={isCurrentPlan}
                  loading={loadingPlan === planId}
                  onClick={() => void handleUpgrade(planId)}
                  data-testid={`billing-plan-action-${planId}`}
                >
                  {actionText}
                </Button>
              </Card>
            )
          })}
        </div>

        <Card className="border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,28,45,0.78),rgba(10,17,31,0.94))]" data-testid="billing-history-card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-1">Payment History</h2>
              <p className="text-sm text-text-2">Your payment history will appear here.</p>
            </div>
            <CreditCard className="h-5 w-5 text-cyan" />
          </div>

          <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] py-16 text-center">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan/20 bg-cyan/[0.06] blur-md" style={{ animation: 'float-shield 3.4s ease-in-out infinite' }} />
              <div className="absolute inset-4 rounded-full border border-cyan/[0.12]" style={{ animation: 'float-shield 3.4s ease-in-out infinite', animationDelay: '0.2s' }} />
              <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[26px] border border-cyan/20 bg-cyan/10 shadow-[0_0_30px_rgba(0,212,255,0.16)]" style={{ animation: 'float-shield 3.4s ease-in-out infinite' }}>
                <Shield className="h-8 w-8 text-cyan" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-text-1">No payments yet</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-text-2">Your payment history will appear here.</p>
          </div>
        </Card>
      </div>
    </>
  )
}