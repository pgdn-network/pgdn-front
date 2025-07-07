import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NodeEvent } from '@/types/node'

interface EventCardProps {
  events: NodeEvent[] | null | undefined
}

function getActionStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'secondary'
    case 'failed':
      return 'destructive'
    case 'in_progress':
      return 'outline'
    case 'pending':
      return 'outline'
    default:
      return 'outline'
  }
}

function getOrchestratorTypeVariant(type: string) {
  switch (type.toLowerCase()) {
    case 'pipeline':
      return 'secondary'
    case 'manual':
      return 'outline'
    default:
      return 'outline'
  }
}

export function EventCard({ events }: EventCardProps) {
  // Ensure events is an array and handle null/undefined cases
  const safeEvents = Array.isArray(events) ? events : []
  
  if (!safeEvents || safeEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Events
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              No events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No events recorded</p>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = safeEvents.reduce((acc, event) => {
    acc[event.action_status.toLowerCase()] = (acc[event.action_status.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Events
          <span className="text-sm font-normal text-muted-foreground">
            {safeEvents.length} events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge 
              key={status} 
              variant={getActionStatusVariant(status)}
              className={status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : undefined}
            >
              {count} {status.toUpperCase()}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-3">
          {safeEvents.map((event, index) => (
            <div key={`${event.uuid}-${index}`} className="border-l-2 border-muted pl-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{event.executed_action}</span>
                <Badge 
                  variant={getActionStatusVariant(event.action_status)} 
                  className={`text-xs ${event.action_status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}`}
                >
                  {event.action_status}
                </Badge>
                <Badge 
                  variant={getOrchestratorTypeVariant(event.orchestrator_type)} 
                  className={`text-xs ${event.orchestrator_type.toLowerCase() === 'pipeline' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : ''}`}
                >
                  {event.orchestrator_type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-mono text-xs">Session: {event.decision.scan_session_id}</p>
              </div>
              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <span>Scan Level: {event.input_state.scan_level}</span>
                <span>Timeout: {event.input_state.timeout_minutes}m</span>
                <span>Deep Scan: {event.input_state.enable_deep_scan ? 'Yes' : 'No'}</span>
                <span>Parallel: {event.input_state.parallel_processing ? 'Yes' : 'No'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}