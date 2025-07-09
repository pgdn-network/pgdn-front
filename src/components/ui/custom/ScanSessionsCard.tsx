import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { NodeScanSession } from '@/types/node';
import { Card } from '@/components/ui/card';

interface ScanSessionsCardProps {
  scanSessions: NodeScanSession[] | null | undefined;
  slug?: string;
  nodeId?: string;
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

export function ScanSessionsCard({ scanSessions, slug, nodeId }: ScanSessionsCardProps) {
  const sessions = Array.isArray(scanSessions) ? scanSessions : [];
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Scan ID</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">No scan sessions available</TableCell>
              </TableRow>
            ) : (
              sortedSessions.map((session) => (
                <TableRow key={session.scan_id}>
                  <TableCell>{session.target || 'General Scan'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(session.status)}>{session.status}</Badge>
                  </TableCell>
                  <TableCell>{session.protocol_filter || '-'}</TableCell>
                  <TableCell>{session.started_at ? new Date(session.started_at).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>{session.completed_at ? calculateDuration(session.started_at, session.completed_at) : '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{session.scan_id}</TableCell>
                  <TableCell>
                    {slug && nodeId && (
                      <Link to={`/organizations/${slug}/nodes/${nodeId}/scans/${session.scan_id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
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