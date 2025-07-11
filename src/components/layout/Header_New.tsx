import React from 'react'
import { Search, Bell, Menu, Settings, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockUser } from '@/mocks/user'
import { ThemeToggle } from '../theme/ThemeToggle'

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-surface/80 border-b border-border/50 shadow-lg">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left Side - Mobile Menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 hover:bg-surface-hover"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Enhanced Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted" />
            </div>
            <Input
              placeholder="Search nodes, reports, configurations..."
              className="pl-10 bg-surface-secondary/50 border-border/50 focus:border-accent/50 focus:bg-surface transition-all duration-300 rounded-xl"
            />
          </div>
        </div>

        {/* Right Side - Actions & User */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-surface-hover rounded-xl transition-all duration-300 relative"
            >
              <Bell className="w-5 h-5 text-muted hover:text-primary transition-colors" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border/50"></div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-xl transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-primary">{mockUser.name}</p>
                <p className="text-xs text-muted">{mockUser.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 py-2 z-50">
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold text-primary">{mockUser.name}</p>
                  <p className="text-xs text-muted">{mockUser.email}</p>
                </div>
                <div className="py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
                <div className="border-t border-border/50 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover text-red-500 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
