import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Server, 
  ScanLine, 
  GitBranch, 
  FileText, 
  Settings,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockUser } from '@/mocks/user'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Server, label: 'Nodes', href: '/nodes' },
  { icon: ScanLine, label: 'Scans', href: '/scans' },
  { icon: GitBranch, label: 'Orchestrations', href: '/orchestrations' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  return (
    <div className="w-60 h-full bg-surface border-r border-border flex flex-col shadow-lg">
      {/* Company/Workspace Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-base">{mockUser.company}</h3>
            <p className="text-sm text-muted">Security Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  'hover:bg-surface-hover hover:shadow-sm',
                  isActive
                    ? 'bg-gradient-to-r from-accent to-accent/90 text-white shadow-md'
                    : 'text-secondary hover:text-primary'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border bg-surface-hover/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-10 h-10 rounded-full ring-2 ring-accent/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">
              {mockUser.name}
            </p>
            <p className="text-xs text-muted truncate">
              {mockUser.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
