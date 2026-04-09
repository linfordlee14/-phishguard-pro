interface NavbarProps {
  title: string
  children?: React.ReactNode
}

export function Navbar({ title, children }: NavbarProps) {
  return (
    <header className="sticky top-4 z-30 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/[0.06] bg-[rgba(10,18,32,0.72)] px-5 py-4 backdrop-blur-xl shadow-[0_12px_48px_rgba(0,0,0,0.22)]">
      <div>
        <p className="mb-1 text-xs uppercase tracking-[0.28em] text-cyan/60">PhishGuard Pro</p>
        <h1 className="text-2xl font-semibold text-text-1" data-testid="page-title">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </header>
  )
}
