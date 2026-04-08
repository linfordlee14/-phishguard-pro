interface NavbarProps {
  title: string
  children?: React.ReactNode
}

export function Navbar({ title, children }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-navy/50 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-xl font-semibold text-text-1">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  )
}
