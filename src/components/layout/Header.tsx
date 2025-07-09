import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Menu, Sun, Moon, Settings, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { WebSocketStatus } from '@/components/ui/custom/WebSocketStatus'
import { ThemeToggle } from '../theme/ThemeToggle'

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
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

          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted" />
            </div>
            <Input
              placeholder="Search nodes, reports, configurations..."
              className="pl-10 bg-surface border-border-strong focus:border-accent focus:bg-surface-secondary transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Side - Actions & User */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <WebSocketStatus />
          
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-surface-hover rounded-md transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5 text-muted hover:text-primary transition-colors" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-md transition-all duration-200"
            >
              <div className="w-8 h-8 bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-primary">
                  {user?.first_name || user?.username || 'User'}
                </p>
                <p className="text-xs text-muted">{user?.role || 'Member'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg border border-border py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-primary">
                    {user?.first_name || user?.username || 'User'}
                  </p>
                  <p className="text-xs text-muted">{user?.email || user?.username}</p>
                </div>
                <div className="py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover no-underline"
                  >
                    <Link to="/profile">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover no-underline"
                  >
                    <Link to="/settings">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </Button>
                </div>
                <div className="border-t border-border py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 px-4 py-2 text-sm hover:bg-surface-hover text-danger hover:text-danger"
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
