import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Check, CreditCard, Zap, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const plans = [
  {
    name: 'Starter',
    price: 'R399',
    period: '/mo',
    seats: 25,
    features: ['25 employee seats', '5 campaigns/month', '3 templates', 'Basic reports', 'Email support'],
    icon: Zap,
    highlight: false,
  },
  {
    name: 'Professional',
    price: 'R749',
    period: '/mo',
    seats: 100,
    features: ['100 employee seats', 'Unlimited campaigns', 'All templates', 'Advanced reports & PDF', 'Priority support', 'Custom branding'],
    icon: Building2,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'R1499',
    period: '/mo',
    seats: 500,
    features: ['500 employee seats', 'Unlimited campaigns', 'All templates + custom', 'Full analytics & API', 'Dedicated account manager', 'SSO & SAML'],
    icon: CreditCard,
    highlight: false,
  },
]

const invoices = [
  { id: 'INV-001', date: '01 Dec 2024', amount: 'R749.00', status: 'paid' },
  { id: 'INV-002', date: '01 Nov 2024', amount: 'R749.00', status: 'paid' },
  { id: 'INV-003', date: '01 Oct 2024', amount: 'R749.00', status: 'paid' },
]

export default function Billing() {
  const [currentPlan] = useState('Professional')
  const [usedSeats] = useState(8)
  const [totalSeats] = useState(100)

  const handleUpgrade = (planName: string) => {
    toast.success(`Mock: redirect to PayFast for ${planName} plan`)
  }

  return (
    <>
      <Navbar title="Billing" />

      <div className="mt-6 space-y-6">
        {/* Current plan */}
        <Card tint="blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-2">Current Plan</p>
              <h2 className="text-xl font-bold text-text-1">{currentPlan}</h2>
            </div>
            <Badge variant="info">Active</Badge>
          </div>
          <ProgressBar label="Seats" value={usedSeats} max={totalSeats} />
          <p className="text-xs text-text-2 mt-2">{usedSeats} of {totalSeats} seats used</p>
        </Card>

        {/* Plans */}
        <div>
          <h3 className="font-semibold text-text-1 mb-4">Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === currentPlan
              const Icon = plan.icon
              return (
                <Card
                  key={plan.name}
                  className={`relative ${plan.highlight ? 'border-cyan shadow-[0_0_15px_rgba(0,212,255,0.1)]' : ''}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan text-navy text-xs font-semibold rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <h3 className="font-semibold text-text-1">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-text-1">{plan.price}</span>
                    <span className="text-text-2 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-2">
                        <Check className="h-4 w-4 text-green shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? 'secondary' : plan.highlight ? 'primary' : 'secondary'}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Invoice history */}
        <Card>
          <h3 className="font-semibold text-text-1 mb-4">Invoice History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-text-2 font-medium">Invoice</th>
                  <th className="p-3 text-left text-text-2 font-medium">Date</th>
                  <th className="p-3 text-left text-text-2 font-medium">Amount</th>
                  <th className="p-3 text-left text-text-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50">
                    <td className="p-3 text-text-1 font-mono-data">{inv.id}</td>
                    <td className="p-3 text-text-2">{inv.date}</td>
                    <td className="p-3 text-text-1 font-mono-data">{inv.amount}</td>
                    <td className="p-3"><Badge variant="success">{inv.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
