import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Mail,
  Users,
  BookOpen,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/campaigns', icon: Mail, label: 'Campaigns' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/training', icon: BookOpen, label: 'Training' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { user, orgName, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40 md:w-64 max-md:w-16 transition-all">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3 max-md:justify-center">
        <Shield className="h-8 w-8 text-cyan shrink-0" />
        <div className="max-md:hidden">
          <h1 className="text-lg font-bold text-text-1 leading-tight">PhishGuard</h1>
          <span className="text-xs text-cyan font-medium">PRO</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-btn)] text-sm transition-colors max-md:justify-center ${
                isActive
                  ? 'bg-cyan/10 text-cyan border-l-2 border-cyan'
                  : 'text-text-2 hover:text-text-1 hover:bg-surface'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="max-md:hidden">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 max-md:justify-center">
          <div className="h-8 w-8 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-sm font-semibold shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="max-md:hidden min-w-0">
            <p className="text-sm text-text-1 truncate">{user?.email}</p>
            <p className="text-xs text-text-2 truncate">{orgName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-2 hover:text-red hover:bg-red/10 rounded-[var(--radius-btn)] transition-colors max-md:justify-center"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="max-md:hidden">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
