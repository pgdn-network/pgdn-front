import { cn } from '@/lib/utils'

export interface StatusDotProps {
  status: 'online' | 'offline' | 'degraded' | 'unknown'
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-400'
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
