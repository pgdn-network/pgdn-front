import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, CheckCircle, AlertTriangle, Clock, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import type { NodeStatus } from '@/types/node'

interface NodeStatusCardProps {
  status: NodeStatus | null
}

function getOperationalStatusVariant(status: string): 'default' | 'destructive' | 'secondary' {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'default'
    case 'critical':
    case 'error':
      return 'destructive'
    case 'warning':
    case 'degraded':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getConnectivityStatusVariant(status: string): 'default' | 'destructive' | 'secondary' {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'default'
    case 'disconnected':
    case 'offline':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return 'N/A'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export function NodeStatusCard({ status }: NodeStatusCardProps) {
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Node Status
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading node status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Node Status
          </div>
          <Badge variant={getOperationalStatusVariant(status.operational_status)}>
            {status.operational_status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
            {status.operational_status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status.operational_status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-foreground">{status.status_message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last checked: {new Date(status.last_checked).toLocaleString()}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connectivity:</span>
              <Badge variant={getConnectivityStatusVariant(status.connectivity_status)} className="text-xs">
                {status.connectivity_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scan Health:</span>
              <Badge variant={getOperationalStatusVariant(status.scan_health)} className="text-xs">
                {status.scan_health}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success Rate:</span>
              <span className="text-sm font-medium text-foreground">{status.success_rate}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Tasks:</span>
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {status.active_tasks_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed Tasks:</span>
              <Badge variant={status.failed_tasks_count > 0 ? 'destructive' : 'secondary'} className="text-xs">
                {status.failed_tasks_count > 0 && <AlertCircle className="h-3 w-3 mr-1" />}
                {status.failed_tasks_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Duration:</span>
              <span className="text-sm font-medium text-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {formatDuration(status.avg_scan_duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Interventions Status */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Interventions</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open:</span>
              <Badge variant={status.open_interventions_count > 0 ? 'secondary' : 'outline'} className="text-xs">
                {status.open_interventions_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical:</span>
              <Badge variant={status.critical_interventions_count > 0 ? 'destructive' : 'secondary'} className="text-xs">
                {status.critical_interventions_count > 0 && <AlertTriangle className="h-3 w-3 mr-1" />}
                {status.critical_interventions_count}
              </Badge>
            </div>
          </div>
        </div>

        {/* Last Scan Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Scan Information</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Scan:</span>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {new Date(status.last_scan_date).toLocaleDateString()}
                </span>
                <Badge variant={status.last_scan_status === 'done' ? 'default' : 'secondary'} className="text-xs">
                  {status.last_scan_status}
                </Badge>
              </div>
            </div>
            {status.next_scheduled_scan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Scan:</span>
                <span className="text-sm text-foreground">
                  {new Date(status.next_scheduled_scan).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}