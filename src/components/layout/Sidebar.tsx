import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ScanLine, 
  GitBranch, 
  FileText, 
  Building2,
  User,
  LogOut,
  ChevronRight,
  Activity,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useOrganizations } from '@/contexts/OrganizationsContext'
import { Button } from '@/components/ui/button'

const baseNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ScanLine, label: 'Scans', href: '/scans' },
  { icon: GitBranch, label: 'Orchestrations', href: '/orchestrations' },
  { icon: FileText, label: 'Reports', href: '/reports' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { organizations } = useOrganizations()

  const navItems = [
    ...baseNavItems.slice(0, 1), // Dashboard
    ...(organizations.length > 1 ? [{ icon: Building2, label: 'Organizations', href: '/organizations' }] : []),
    ...baseNavItems.slice(1) // Rest of the items
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="w-60 h-full bg-surface-secondary border-r border-border-strong flex flex-col">
      {/* Company/Workspace Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-accent flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success border-2 border-surface"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary text-base">PGDN</h3>
            <p className="text-sm text-muted">
              Security Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-surface-hover',
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-primary hover:text-primary hover:bg-surface-hover'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className={cn(
                'w-4 h-4 transition-all duration-200',
                'opacity-0 group-hover:opacity-100'
              )} />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Network Status */}
      <div className="p-4 border-t border-border">
        <div className="bg-surface-secondary p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-primary">Network Health</h4>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">98.5%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Globe className="w-3 h-3" />
            <span>247 nodes online</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 bg-surface-secondary hover:bg-surface-hover transition-all duration-200 group cursor-pointer">
          <div className="relative">
            <div className="w-8 h-8 bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success border-2 border-surface"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
              {user?.first_name || user?.username || 'User'}
            </p>
            <p className="text-xs text-muted truncate">{user?.role || 'Member'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 h-auto"
          >
            <LogOut className="w-4 h-4 text-muted" />
          </Button>
        </div>
      </div>
    </div>
  )
}
