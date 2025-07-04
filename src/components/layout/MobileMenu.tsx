import { Menu, X } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden inline-flex items-center justify-center rounded-lg w-9 h-9 bg-surface hover:bg-surface-hover border border-border transition-colors"
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <X className="h-4 w-4 text-secondary" />
      ) : (
        <Menu className="h-4 w-4 text-secondary" />
      )}
    </button>
  )
}
