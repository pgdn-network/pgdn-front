import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import { NodeApiService } from '@/api/nodes';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';

const OrgNodePublishes: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [publishes, setPublishes] = useState<any[]>([]);
  const [publishesLoading, setPublishesLoading] = useState(true);
  const [publishesError, setPublishesError] = useState<string | null>(null);
  
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

  const organizationUuid = organizations.find(org => org.slug === slug)?.uuid;

  useEffect(() => {
    const fetchPublishes = async () => {
      if (!organizationUuid || !nodeId) return;

      setPublishesLoading(true);
      setPublishesError(null);

      try {
        const data = await NodeApiService.getNodeLedgerPublishes(organizationUuid, nodeId);
        setPublishes(data);
      } catch (err) {
        console.error('Error fetching publishes:', err);
        setPublishesError('Failed to load publishes');
      } finally {
        setPublishesLoading(false);
      }
    };

    fetchPublishes();
  }, [organizationUuid, nodeId]);

  // Helper function to infer blockchain from transaction hash
  const inferBlockchain = (transactionHash: string): string => {
    if (!transactionHash) return 'Unknown';
    
    // Sui transaction hashes are 64 hex characters (32 bytes)
    if (transactionHash.length === 64 && /^[a-fA-F0-9]+$/.test(transactionHash)) {
      return 'sui';
    }
    
    // zkSync transaction hashes are typically 66 characters (0x + 64 hex)
    if (transactionHash.length === 66 && transactionHash.startsWith('0x')) {
      return 'zksync';
    }
    
    return 'Unknown';
  };

  if (loading || orgsLoading || publishesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || publishesError) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Publishes</h3>
            <p className="text-muted-foreground mb-4">{error || publishesError}</p>
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
      hideScanButton={true}
    >
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="outline">
          {publishes.length} total publishes
        </Badge>
      </div>
      
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Blockchain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No blockchain publishes found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              publishes.map((publish) => (
                <TableRow key={publish.id || publish.uuid}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {publish.report_title || 'Unknown Report'}
                      </div>
                      {publish.report_uuid && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {publish.report_uuid}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase">
                      {publish.blockchain || inferBlockchain(publish.transaction_hash)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        publish.status === 'success' || publish.status === 'completed' ? 'default' : 
                        publish.status === 'failed' || publish.status === 'error' ? 'destructive' : 
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {publish.status === 'success' ? 'Completed' : publish.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {publish.created_at 
                        ? new Date(publish.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {publish.transaction_hash ? (
                      <div className="truncate max-w-32" title={publish.transaction_hash}>
                        {publish.transaction_hash}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {publish.report_uuid && (
                        <Link 
                          to={`/organizations/${slug}/nodes/${nodeId}/reports/${publish.report_uuid}`}
                          className="inline-flex"
                        >
                          <Button variant="ghost" size="sm" title="View Report">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </NodeMainLayout>
  );
};

export default OrgNodePublishes;
