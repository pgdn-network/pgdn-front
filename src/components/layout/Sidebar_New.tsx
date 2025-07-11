import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Server, 
  ScanLine, 
  GitBranch, 
  FileText, 
  Settings,
  Building2,
  User,
  LogOut,
  ChevronRight,
  Zap,
  Activity,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockUser } from '@/mocks/user'
import { Button } from '@/components/ui/button'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', color: 'text-blue-500' },
  { icon: Server, label: 'Nodes', href: '/nodes', color: 'text-purple-500' },
  { icon: ScanLine, label: 'Scans', href: '/scans', color: 'text-red-500' },
  { icon: GitBranch, label: 'Orchestrations', href: '/orchestrations', color: 'text-green-500' },
  { icon: FileText, label: 'Reports', href: '/reports', color: 'text-orange-500' },
  { icon: Settings, label: 'Settings', href: '/settings', color: 'text-gray-500' },
]

export function Sidebar() {
  return (
    <div className="w-60 h-full bg-gradient-to-b from-surface via-surface to-surface-secondary border-r border-border/50 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/3 via-transparent to-accent/5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-accent/8 to-transparent rounded-full blur-2xl"></div>
      
      {/* Company/Workspace Header */}
      <div className="relative p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent via-accent-hover to-accent/80 flex items-center justify-center shadow-xl">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-surface animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary text-lg tracking-tight">{mockUser.company}</h3>
            <p className="text-sm text-muted flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Security Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
                  'hover:bg-surface-hover hover:shadow-md hover:scale-105',
                  isActive
                    ? 'bg-gradient-to-r from-accent/15 to-accent/10 text-accent shadow-lg border border-accent/20'
                    : 'text-secondary hover:text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Background glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-2xl blur-xl"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    isActive 
                      ? 'bg-gradient-to-br from-accent to-accent-hover shadow-lg' 
                      : 'bg-surface-secondary group-hover:bg-surface-hover'
                  )}>
                    <item.icon className={cn(
                      'w-5 h-5 transition-all duration-300',
                      isActive ? 'text-white' : item.color
                    )} />
                  </div>
                  
                  {/* Label */}
                  <span className="relative z-10 flex-1">{item.label}</span>
                  
                  {/* Chevron indicator */}
                  <ChevronRight className={cn(
                    'w-4 h-4 transition-all duration-300',
                    isActive ? 'text-accent opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Network Status */}
      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-r from-surface-secondary to-surface-hover rounded-2xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-primary">Network Health</h4>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">98.5%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Globe className="w-3 h-3" />
            <span>3 open actions</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50 relative">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary hover:bg-surface-hover transition-all duration-300 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{mockUser.name}</p>
            <p className="text-xs text-muted truncate">{mockUser.role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 h-auto"
          >
            <LogOut className="w-4 h-4 text-muted" />
          </Button>
        </div>
      </div>
    </div>
  )
}
