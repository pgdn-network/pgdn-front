import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, CheckCircle, AlertTriangle, Clock, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import type { NodeStatus } from '@/types/node'

interface NodeStatusCardProps {
  status: NodeStatus | null
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'connected':
      return '!bg-blue-600 !text-white !border-blue-600';
    case 'healthy':
      return '!bg-green-600 !text-white !border-green-600';
    case 'critical':
    case 'error':
      return '!bg-red-600 !text-white !border-red-600';
    case 'warning':
    case 'degraded':
      return '!bg-yellow-500 !text-white !border-yellow-500';
    default:
      return '!bg-gray-800 !text-white !border-gray-800';
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
          <Badge className={getStatusBadgeClass(status.operational_status) + ' text-xs'}>
            {status.operational_status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
            {status.operational_status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {status.operational_status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="bg-gray-100 dark:bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-foreground">{status.status_message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last checked: {new Date(status.last_checked).toLocaleString()}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Connectivity:</span>
              <Badge className={getStatusBadgeClass(status.connectivity_status) + ' text-xs'}>
                {status.connectivity_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Scan Health:</span>
              <Badge className={getStatusBadgeClass(status.scan_health) + ' text-xs'}>
                {status.scan_health}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Success Rate:</span>
              <span className="text-sm font-medium text-foreground">{status.success_rate}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Active Tasks:</span>
              <Badge className="!bg-blue-600 !text-white !border-blue-600 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {status.active_tasks_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Failed Tasks:</span>
              <Badge className={status.failed_tasks_count > 0 ? '!bg-red-600 !text-white !border-red-600 text-xs' : '!bg-gray-800 !text-white !border-gray-800 text-xs'}>
                {status.failed_tasks_count > 0 && <AlertCircle className="h-3 w-3 mr-1" />}
                {status.failed_tasks_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Avg Duration:</span>
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
              <span className="text-sm text-foreground">Open:</span>
              <Badge className={status.open_interventions_count > 0 ? '!bg-yellow-500 !text-white !border-yellow-500 text-xs' : '!bg-gray-800 !text-white !border-gray-800 text-xs'}>
                {status.open_interventions_count}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Critical:</span>
              <Badge className={status.critical_interventions_count > 0 ? '!bg-red-600 !text-white !border-red-600 text-xs' : '!bg-gray-800 !text-white !border-gray-800 text-xs'}>
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
              <span className="text-sm text-foreground">Last Scan:</span>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {new Date(status.last_scan_date).toLocaleDateString()}
                </span>
                <Badge className={status.last_scan_status === 'done' ? '!bg-green-600 !text-white !border-green-600 text-xs' : '!bg-gray-800 !text-white !border-gray-800 text-xs'}>
                  {status.last_scan_status}
                </Badge>
              </div>
            </div>
            {status.next_scheduled_scan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Next Scan:</span>
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