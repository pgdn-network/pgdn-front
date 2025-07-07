import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Server, AlertTriangle, Loader2, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import type { CveMatch } from '@/types/node';

const OrgNodeCves: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [cves, setCves] = useState<CveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchCVEs = async () => {
      if (!organizationUuid || !nodeId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch all CVEs (not limited to 5)
        const cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeId, 1000);
        setCves(Array.isArray(cveData) ? cveData : []);
      } catch (err) {
        console.error('Error fetching CVEs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch CVEs');
      } finally {
        setLoading(false);
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

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading CVEs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!orgsLoading && !organization)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading CVEs</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to={`/organizations/${slug}/nodes/${nodeId}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Node
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              <AlertTriangle className="h-8 w-8 inline mr-2" />
              CVEs - {organization?.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Security vulnerabilities detected for this node
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total CVEs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cves.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open CVEs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fixed CVEs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{closedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter CVEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'open' | 'closed')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({cves.length})</TabsTrigger>
                <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
                <TabsTrigger value="closed">Fixed ({closedCount})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* CVEs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' && 'All CVEs'}
              {filter === 'open' && 'Open CVEs'}
              {filter === 'closed' && 'Fixed CVEs'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredCVEs.length} found)
              </span>
            </CardTitle>
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
    </div>
  );
};

export default OrgNodeCves; 