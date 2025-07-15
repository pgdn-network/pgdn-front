import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { NodeScanSession } from '@/types/node';
import { Card } from '@/components/ui/card';

interface ScanSessionsCardProps {
  scanSessions: NodeScanSession[] | null | undefined;
  slug?: string;
  nodeId?: string;
  viewAllHref?: string;
  onDispute?: (sessionId: string, scanTypes: string[], target: string) => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'done':
    case 'complete':
      return '!bg-green-600 !text-white !border-green-600';
    case 'failed':
    case 'error':
      return '!bg-red-600 !text-white !border-red-600';
    case 'running':
    case 'in_progress':
      return '!bg-blue-600 !text-white !border-blue-600';
    default:
      return '!bg-gray-800 !text-white !border-gray-800';
  }
}

function calculateDuration(started: string, completed: string | null): string {
  if (!completed) return 'In progress';
  const startTime = new Date(started).getTime();
  const endTime = new Date(completed).getTime();
  const durationMs = endTime - startTime;
  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.round((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function ScanSessionsCard({ scanSessions, slug, nodeId, viewAllHref, onDispute }: ScanSessionsCardProps) {
  const sessions = Array.isArray(scanSessions) ? scanSessions : [];
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleDispute = (session: NodeScanSession) => {
    if (!onDispute) return;
    
    const scanTypes = Array.isArray((session as any).scan_types) 
      ? (session as any).scan_types 
      : ['unknown'];
    const target = session.target || 'unknown';
    
    onDispute(session.session_id, scanTypes, target);
  };

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-medium">{sortedSessions.length} scan{sortedSessions.length === 1 ? '' : 's'}</span>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-primary underline text-xs font-medium"
          >
            View all scans
          </a>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Scan Types</TableHead>
              <TableHead>Scan Level</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Error</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No scan sessions available</TableCell>
              </TableRow>
            ) : (
              sortedSessions.map((session) => (
                <TableRow key={session.session_id}>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(session.status)}>{session.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {Array.isArray((session as any).scan_types) && (session as any).scan_types.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(session as any).scan_types.map((type: string) => (
                          <Badge key={type} variant="default" className="text-xs font-semibold uppercase tracking-wide bg-primary text-white">{type}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{session.scan_level ?? '-'}</TableCell>
                  <TableCell>{session.started_at ? new Date(session.started_at).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{session.completed_at ? calculateDuration(session.started_at, session.completed_at) : '-'}</TableCell>
                  <TableCell className="text-xs text-red-600">{session.error_message || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {slug && nodeId && (
                        <Link to={`/organizations/${slug}/nodes/${nodeId}/scans/${session.session_id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {onDispute && (session.status === 'done' || session.status === 'complete') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDispute(session)}
                          title="Dispute Results"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}