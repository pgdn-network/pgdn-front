import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, Target, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { NodeScanSession } from '@/types/node'

interface ScanSessionsCardProps {
  scanSessions: NodeScanSession[] | null | undefined
}

function getStatusVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status.toLowerCase()) {
    case 'done':
    case 'complete':
      return 'default'
    case 'failed':
    case 'error':
      return 'destructive'
    case 'running':
    case 'in_progress':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'done':
    case 'complete':
      return '!bg-green-600 !text-white !border-green-600'
    case 'failed':
    case 'error':
      return '!bg-red-600 !text-white !border-red-600'
    case 'running':
    case 'in_progress':
      return '!bg-blue-600 !text-white !border-blue-600'
    default:
      return '!bg-gray-800 !text-white !border-gray-800'
  }
}

function calculateDuration(started: string, completed: string | null): string {
  if (!completed) return 'In progress'
  
  const startTime = new Date(started).getTime()
  const endTime = new Date(completed).getTime()
  const durationMs = endTime - startTime
  
  if (durationMs < 1000) return `${durationMs}ms`
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`
  
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.round((durationMs % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export function ScanSessionsCard({ scanSessions }: ScanSessionsCardProps) {
  // Ensure scanSessions is an array and handle null/undefined cases
  const sessions = Array.isArray(scanSessions) ? scanSessions : []
  
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Scan Sessions
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              No scans
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No scan sessions available</p>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = sessions.reduce((acc, session) => {
    acc[session.status] = (acc[session.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort sessions by created_at date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Scan Sessions
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Badge key={status} className={getStatusBadgeClass(status)}>
              {count} {status.toUpperCase()}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-3">
          {sortedSessions.map((session) => (
            <div key={session.scan_id} className="border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {session.target || 'General Scan'}
                    </span>
                    {session.scan_level && (
                      <Badge variant="outline" className="text-xs">
                        Level {session.scan_level}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Scan ID: {session.scan_id}
                  </p>
                </div>
                <Badge className={getStatusBadgeClass(session.status)}>
                  {session.status === 'complete' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {session.error_message && <AlertCircle className="h-3 w-3 mr-1" />}
                  {session.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Started: {new Date(session.started_at).toLocaleString()}
                </div>
                {session.completed_at && (
                  <div className="flex items-center gap-1">
                    Duration: {calculateDuration(session.started_at, session.completed_at)}
                  </div>
                )}
                {session.protocol_filter && (
                  <div>
                    Protocol: {session.protocol_filter}
                  </div>
                )}
              </div>

              {session.error_message && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded text-xs">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {session.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}