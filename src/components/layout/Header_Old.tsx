import { Search, Bell, ChevronDown, User, LogOut, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { mockUser } from '@/mocks/user'
import { useState } from 'react'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="h-18 bg-surface/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden inline-flex items-center justify-center rounded-xl w-11 h-11 bg-surface hover:bg-surface-hover border border-border transition-all duration-200 hover:shadow-md"
      >
        <Menu className="w-5 h-5 text-secondary" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search nodes, scans, reports..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-xl text-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 hover:border-accent/50 shadow-sm"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {/* Notification Bell */}
        <button className="relative inline-flex items-center justify-center rounded-xl w-11 h-11 bg-surface hover:bg-surface-hover border border-border transition-all duration-200 hover:shadow-md">
          <Bell className="w-5 h-5 text-secondary" />
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-accent to-accent/80 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-accent/20"
            />
            <span className="text-sm font-semibold text-primary hidden sm:block">
              {mockUser.name}
            </span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl py-2 z-50 backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-accent/5 to-accent/10">
                <p className="text-sm font-semibold text-primary">{mockUser.name}</p>
                <p className="text-xs text-muted">{mockUser.email}</p>
                <p className="text-xs text-accent font-medium">{mockUser.role}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-all duration-200">
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-surface-hover hover:text-primary transition-all duration-200">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
