import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { firebaseInitializationError } from '@/services/firebase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-card flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent" />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="h-12 w-12 text-cyan" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-text-1">PhishGuard</h1>
              <span className="text-sm text-cyan font-semibold tracking-wider">PRO</span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-text-1 mb-2">Train your team.</p>
          <p className="text-2xl font-semibold text-cyan mb-8">Stop the click.</p>

          {/* Fake phishing email mockup */}
          <div className="card p-0 overflow-hidden text-left relative">
            <div className="bg-red/10 border-b border-red/30 px-4 py-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-red uppercase tracking-wider">⚠ Phishing Simulation</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-2">From:</span>
                <span className="text-xs text-text-1">refunds@sars-gov-za.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-2">Subject:</span>
                <span className="text-xs text-text-1 font-medium">Your SARS Tax Refund is Ready</span>
              </div>
              <div className="mt-3 text-sm text-text-2">
                Dear Taxpayer, your refund of <span className="text-text-1 font-medium">R12,450.00</span> has been approved...
              </div>
              <div className="mt-2 px-4 py-1.5 bg-red/20 text-red text-xs rounded inline-block">
                Verify & Claim Refund →
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] border-4 border-red text-red font-bold text-2xl px-6 py-2 rounded-lg opacity-40 pointer-events-none">
              PHISHING
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-navy">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Shield className="h-10 w-10 text-cyan" />
            <span className="text-2xl font-bold text-text-1">PhishGuard Pro</span>
          </div>

          <h2 className="text-2xl font-semibold text-text-1 mb-1">Welcome back</h2>
          <p className="text-text-2 mb-8">Sign in to your account</p>

          {firebaseInitializationError && (
            <div className="mb-6 rounded-[20px] border border-amber/30 bg-amber/[0.08] px-4 py-3" data-testid="firebase-config-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber" />
                <div>
                  <p className="text-sm font-semibold text-text-1">Runtime setup needed</p>
                  <p className="mt-1 text-sm text-text-2">{firebaseInitializationError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.za"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-text-2 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan hover:text-cyan-dim transition-colors">
              Start free 14-day trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
