import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!companyName.trim()) errs.companyName = 'Company name is required'
    if (!fullName.trim()) errs.fullName = 'Full name is required'
    if (!email.trim()) errs.email = 'Email is required'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(email, password, companyName, fullName)
      toast.success('Account created! Welcome to PhishGuard Pro.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Shield className="h-10 w-10 text-cyan" />
          <div>
            <h1 className="text-2xl font-bold text-text-1">PhishGuard Pro</h1>
            <span className="text-xs text-cyan font-semibold">14-day free trial</span>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-text-1 mb-1">Create your account</h2>
          <p className="text-text-2 text-sm mb-6">No credit card required</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Linfy Tech Solutions"
              error={errors.companyName}
              required
            />
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Thandi Dlamini"
              error={errors.fullName}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.za"
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Start Free Trial
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-text-2 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan hover:text-cyan-dim transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
