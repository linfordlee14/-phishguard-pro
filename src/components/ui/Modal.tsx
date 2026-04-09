import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,9,18,0.78)] backdrop-blur-md"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`card mx-4 w-full border border-white/[0.06] p-6 ${sizeClasses[size]}`}>
        <div className="mb-5 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-text-1">{title}</h2>}
          <button onClick={onClose} className="ml-auto rounded-xl border border-white/[0.08] p-2 text-text-2 transition-colors hover:border-cyan/20 hover:text-text-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
