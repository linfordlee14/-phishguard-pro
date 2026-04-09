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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
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

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, orgName, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'Analyst'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] bg-[rgba(7,13,24,0.9)] px-3 py-4 backdrop-blur-2xl transition-[width] duration-300 max-md:!w-16"
      style={{ width: collapsed ? '64px' : '220px' }}
      data-testid="app-sidebar"
    >
      <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] px-2 pb-4 max-md:justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/[0.08] shadow-[0_0_30px_rgba(0,212,255,0.14)]">
          <Shield className="h-5 w-5 text-cyan shrink-0" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-semibold tracking-tight text-text-1">PhishGuard</h1>
            <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-cyan/70">Security Ops</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            data-testid={`sidebar-link-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm transition-all duration-200 max-md:justify-center ${
                isActive
                  ? 'border-l-2 border-cyan bg-cyan/10 text-cyan shadow-[inset_0_0_0_1px_rgba(0,212,255,0.12)]'
                  : 'text-text-2 hover:bg-white/[0.04] hover:text-text-1'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronRight className="ml-auto h-4 w-4 text-text-2/40 transition-transform group-hover:translate-x-0.5" />}
            {collapsed && (
              <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-white/[0.08] bg-[rgba(7,13,24,0.96)] px-3 py-1.5 text-xs font-medium text-text-1 shadow-[0_12px_32px_rgba(0,0,0,0.28)] group-hover:block">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 space-y-3 border-t border-white/[0.06] px-1 pt-4">
        <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-center gap-3 max-md:justify-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan/[0.15] bg-cyan/10 text-sm font-semibold text-cyan">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-1" data-testid="sidebar-user-name">{displayName}</p>
                <p className="truncate text-xs text-text-2">{orgName || 'Security Team'}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => navigate('/settings')}
                className="rounded-xl border border-white/[0.08] p-2 text-text-2 transition-colors hover:border-cyan/25 hover:text-cyan"
                data-testid="sidebar-settings-button"
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan">
                Pro
              </span>
              <p className="truncate text-xs text-text-2">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm text-text-2 transition-colors hover:bg-red/10 hover:text-red max-md:justify-center"
          data-testid="sidebar-signout-button"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex w-full items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-sm text-text-1 transition-colors hover:border-cyan/20 hover:bg-cyan/[0.08] max-md:justify-center"
          data-testid="sidebar-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>}
        </button>
      </div>
    </aside>
  )
}
