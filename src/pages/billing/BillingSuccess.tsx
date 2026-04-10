import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type PlanId = 'starter' | 'pro' | 'business'

const PLAN_META: Record<PlanId, { label: string; seatsLimit: number }> = {
  starter: { label: 'Starter', seatsLimit: 10 },
  pro: { label: 'Pro', seatsLimit: 25 },
  business: { label: 'Business', seatsLimit: 100 },
}

export default function BillingSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planParam = (searchParams.get('plan') || 'starter') as PlanId
  const plan = PLAN_META[planParam] || PLAN_META.starter

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as Window & { confetti?: (options: object) => void }).confetti === 'function') {
      ;(window as Window & { confetti: (options: object) => void }).confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00d4ff', '#ffffff', '#2ec4b6'],
      })
    }
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center py-8">
      <Card className="w-full max-w-[480px] border border-cyan/[0.16] bg-[linear-gradient(180deg,rgba(18,28,45,0.82),rgba(10,17,31,0.96))] text-center shadow-[0_0_0_1px_rgba(0,212,255,0.08),0_24px_70px_rgba(0,0,0,0.32)]" data-testid="billing-success-card">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan/20 bg-cyan/[0.08] shadow-[0_0_30px_rgba(0,212,255,0.16)]">
          <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
            <circle cx="26" cy="26" r="21" stroke="rgba(0,212,255,0.2)" strokeWidth="2" />
            <path d="M15 27.5L22.5 35L37.5 19" stroke="#00d4ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40">
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" fill="freeze" />
            </path>
          </svg>
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text-1" data-testid="billing-success-title">You&apos;re all set! 🎉</h1>
        <p className="mt-3 text-sm leading-7 text-text-2" data-testid="billing-success-subtitle">Your {plan.label} plan is now active.</p>

        <div className="mt-6 rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-5 text-left">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <span className="text-sm text-text-2">Unlocked capacity</span>
            <span className="font-mono-data text-lg text-text-1">{plan.seatsLimit} seats</span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-1">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10 text-cyan">✓</span>
              <span>{plan.seatsLimit} employee seats unlocked</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10 text-cyan">✓</span>
              <span>All {plan.label} features active</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button className="w-full" size="lg" onClick={() => navigate('/dashboard')} data-testid="billing-success-dashboard-button">
            Go to Dashboard
          </Button>
          <button type="button" onClick={() => navigate('/billing')} className="text-sm font-medium text-cyan transition-colors hover:text-cyan-dim" data-testid="billing-success-billing-link">
            View billing
          </button>
        </div>
      </Card>
    </div>
  )
}