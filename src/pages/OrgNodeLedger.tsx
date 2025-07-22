import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Calendar, ExternalLink, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import NodeApiService from '@/api/nodes';

const OrgNodeLedger: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishes, setPublishes] = useState<any[]>([]);
  const [publishesLoading, setPublishesLoading] = useState(false);
  const [publishesError, setPublishesError] = useState<string | null>(null);
  
  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchNodeData = async () => {
      if (!organizationUuid || !nodeId) return;

      try {
        setLoading(true);
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeId);
        setNode(nodeData);
      } catch (err) {
        console.error('Error fetching node:', err);
        setError('Failed to load node data');
      } finally {
        setLoading(false);
      }
    };

    fetchNodeData();
  }, [organizationUuid, nodeId]);

  useEffect(() => {
    const fetchPublishes = async () => {
      if (!organizationUuid || !nodeId) return;

      try {
        setPublishesLoading(true);
        setPublishesError(null);
        const publishData = await NodeApiService.getNodeLedgerPublishes(organizationUuid, nodeId);
        setPublishes(publishData);
      } catch (err) {
        console.error('Error fetching publishes:', err);
        setPublishesError('Failed to load ledger publishes');
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

  const getExplorerUrl = (blockchain: string, transactionHash: string, networkType?: string): string => {
    if (blockchain === 'sui') {
      if (networkType === 'testnet') {
        return `https://testnet.suivision.xyz/txblock/${transactionHash}?tab=Overview`;
      } else {
        return `https://suivision.xyz/txblock/${transactionHash}?tab=Overview`;
      }
    } else if (blockchain === 'zksync') {
      if (networkType === 'testnet') {
        return `https://sepolia.explorer.zksync.io/tx/${transactionHash}`;
      } else {
        return `https://explorer.zksync.io/tx/${transactionHash}`;
      }
    }
    return '#';
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
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Ledger Data</h3>
            <p className="text-muted-foreground mb-4">{error || publishesError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <Button onClick={() => window.history.back()}>Go Back</Button>
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
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Blockchain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Block Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No blockchain publishes found</p>
                      <p className="text-sm text-muted-foreground">
                        Publish security analysis reports to see them appear here
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                publishes.map((publish) => {
                  const blockchain = publish.network || publish.blockchain || inferBlockchain(publish.transaction_hash);
                  const explorerUrl = getExplorerUrl(blockchain, publish.transaction_hash, publish.network_type);
                  
                  return (
                    <TableRow key={publish.uuid}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            Security Analysis Report
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
                          {blockchain}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {publish.block_number || '-'}
                      </TableCell>
                      <TableCell>
                        {publish.transaction_hash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(explorerUrl, '_blank')}
                            title="View on blockchain explorer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {publishes.length > 0 && (
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Trust Score:</strong> Reports published to the blockchain include trust scores based on security analysis.
              </p>
              <p>
                <strong>Verification:</strong> All published data is cryptographically signed and can be independently verified on the blockchain.
              </p>
            </div>
          </Card>
        )}
      </div>
    </NodeMainLayout>
  );
};

export default OrgNodeLedger;
