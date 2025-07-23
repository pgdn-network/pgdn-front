import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { useBasicNodeData } from '@/hooks/useNodeData';
import type { CveMatch } from '@/types/node';

const OrgNodeCves: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [cves, setCves] = useState<CveMatch[]>([]);
  const [cveLoading, setCveLoading] = useState(true);
  const [cveError, setCveError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  // Get basic node data for NodeMainLayout
  const { 
    node, 
    loading: nodeLoading, 
    error: nodeError 
  } = useBasicNodeData(organizationUuid, nodeId || '');

  useEffect(() => {
    const fetchCVEs = async () => {
      if (!organizationUuid || !nodeId) return;

      try {
        setCveLoading(true);
        setCveError(null);
        
        // Fetch all CVEs (not limited to 5)
        const cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeId, 1000);
        setCves(Array.isArray(cveData) ? cveData : []);
      } catch (err) {
        console.error('Error fetching CVEs:', err);
        setCveError(err instanceof Error ? err.message : 'Failed to fetch CVEs');
      } finally {
        setCveLoading(false);
      }
    };

    fetchCVEs();
  }, [organizationUuid, nodeId]);

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (fixed: boolean) => {
    return fixed ? 'secondary' : 'destructive';
  };

  const filteredCVEs = cves.filter(cve => {
    if (filter === 'open') return !cve.fixed;
    if (filter === 'closed') return cve.fixed;
    return true; // 'all'
  });

  const openCount = cves.filter(cve => !cve.fixed).length;
  const closedCount = cves.filter(cve => cve.fixed).length;

  const loading = nodeLoading || cveLoading || orgsLoading;
  const error = nodeError || cveError;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || (!orgsLoading && !organization)) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading CVEs</h3>
            <p className="text-muted-foreground mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Node Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested node could not be found.</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
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
      reportsData={null}
      snapshotData={null}
      actionsData={null}
      loading={loading}
      hideScanButton={true}
    >
      <div className="space-y-6">
        {/* CVEs Table with integrated filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {filter === 'all' && 'All CVEs'}
                {filter === 'open' && 'Open CVEs'}
                {filter === 'closed' && 'Fixed CVEs'}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredCVEs.length} found)
                </span>
              </CardTitle>
              <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'open' | 'closed')}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">All ({cves.length})</TabsTrigger>
                  <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
                  <TabsTrigger value="closed">Fixed ({closedCount})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCVEs.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'all' && 'No CVEs found for this node.'}
                  {filter === 'open' && 'No open CVEs found for this node.'}
                  {filter === 'closed' && 'No fixed CVEs found for this node.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CVE ID</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>CVSS Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Matched At</TableHead>
                    <TableHead>Fixed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCVEs.map((cve) => (
                    <TableRow key={cve.match_uuid}>
                      <TableCell>
                        <span className="font-mono text-sm">{cve.cve_id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(cve.severity)}>
                          {cve.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{cve.cvss_score}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(cve.fixed)}>
                          {cve.fixed ? 'Fixed' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {(cve.confidence_score * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(cve.matched_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {cve.date_fixed ? new Date(cve.date_fixed).toLocaleDateString() : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/organizations/${slug}/nodes/${nodeId}/cves/${cve.match_uuid}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </NodeMainLayout>
  );
};

export default OrgNodeCves; 