import { cn } from '@/lib/utils'

export interface StatusDotProps {
  status: 'online' | 'offline' | 'degraded' | 'unknown'
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colors = {
    online: 'bg-secondary',
    offline: 'bg-muted',
    degraded: 'bg-secondary',
    unknown: 'bg-muted'
  }

  return (
    <div
      className={cn(
        'w-2 h-2 rounded-full',
        colors[status],
        status === 'online' && 'animate-pulse',
        className
      )}
    />
  )
}
