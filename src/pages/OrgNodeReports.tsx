import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Eye, Calendar, AlertTriangle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import type { NodeReport } from '@/types/node';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';

const OrgNodeReports: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const {
    node,
    organization,
    reportsData,
    snapshotData,
    loading,
    error
  } = useNodeData(
    organizations.find(org => org.slug === slug)?.uuid || '',
    nodeId || ''
  );

  if (loading || orgsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Reports</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <NodeMainLayout
      node={node}
      organization={organization}
      nodeId={nodeId || ''}
      slug={slug || ''}
      onStartScan={() => {}}
      cveData={null}
      eventsData={null}
      scanSessionsData={null}
      reportsData={reportsData}
      snapshotData={snapshotData}
      actionsData={null}
      loading={loading}
    >
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="outline">
          {reportsData?.reports?.length || 0} total reports
        </Badge>
      </div>
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Session ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!reportsData?.reports || reportsData.reports.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No reports available</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reportsData.reports.map((report: NodeReport) => (
                <TableRow key={report.uuid}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{report.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {report.summary}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {report.report_type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.risk_score >= 15 ? 'destructive' : report.risk_score >= 10 ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {report.risk_score >= 15 ? 'Critical' : report.risk_score >= 10 ? 'High' : report.risk_score >= 5 ? 'Medium' : 'Low'} ({report.risk_score})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {report.session_id}
                  </TableCell>
                  <TableCell>
                    <Link 
                      to={`/organizations/${slug}/nodes/${nodeId}/reports/${report.uuid}`}
                      className="inline-flex"
                    >
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      {/* Pagination (if needed) */}
      {/* ...pagination logic here... */}
    </NodeMainLayout>
  );
};

export default OrgNodeReports; 