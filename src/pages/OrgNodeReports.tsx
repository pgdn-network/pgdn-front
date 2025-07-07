import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Eye, Calendar, AlertTriangle, Shield } from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/common/Breadcrumb';
import { NodeApiService } from '@/api/nodes';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import type { NodeReport } from '@/types/node';

const OrgNodeReports: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [reports, setReports] = useState<NodeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [nodeName, setNodeName] = useState<string>('');
  const limit = 20;

  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchReports = async () => {
      if (!organizationUuid || !nodeId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await NodeApiService.getNodeReports(organizationUuid, nodeId, limit);
        setReports(response.reports);
        setTotalReports(response.total);
        // Extract node name from the first report if available
        if (response.reports.length > 0) {
          // We'll need to fetch node details separately or get it from the response
          setNodeName(`Node ${nodeId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [organizationUuid, nodeId, currentPage]);

  const getRiskScoreVariant = (score: number): 'destructive' | 'secondary' | 'default' => {
    if (score >= 15) return 'destructive';
    if (score >= 10) return 'secondary';
    return 'default';
  };

  const getRiskScoreLabel = (score: number): string => {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Organizations', href: '/organizations' },
    { label: slug || '', href: `/organizations/${slug}` },
    { label: 'Nodes', href: `/organizations/${slug}` },
    { label: nodeName || nodeId || '', href: `/organizations/${slug}/nodes/${nodeId}` },
    { label: 'Reports' }
  ];

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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to={`/organizations/${slug}/nodes/${nodeId}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent" />
              Security Reports
            </h1>
          </div>
          <p className="text-secondary max-w-2xl">
            Security analysis reports for {nodeName || `Node ${nodeId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {totalReports} total reports
          </Badge>
        </div>
      </div>

      {/* Reports Table */}
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
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No reports available</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
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
                      variant={getRiskScoreVariant(report.risk_score)}
                      className="text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {getRiskScoreLabel(report.risk_score)} ({report.risk_score})
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

      {/* Pagination */}
      {totalReports > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalReports)} of {totalReports} reports
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {Math.ceil(totalReports / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalReports / limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgNodeReports; 