import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Network, AlertTriangle, Loader2, Wifi, WifiOff } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NodeApiService } from '@/api/nodes';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import type { NodeIp, NodeIpsResponse } from '@/types/node';

const NodeIps: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [nodeIpsData, setNodeIpsData] = useState<NodeIpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);

  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  const fetchNodeIps = async () => {
    if (!organizationUuid || !nodeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await NodeApiService.getNodeIps(organizationUuid, nodeId, activeOnly);
      setNodeIpsData(response);
    } catch (err) {
      console.error('Failed to fetch node IPs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch node IPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationUuid && nodeId) {
      fetchNodeIps();
    }
  }, [organizationUuid, nodeId, activeOnly]);

  const handleActiveOnlyToggle = (checked: boolean) => {
    setActiveOnly(checked);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Organizations', href: '/organizations' },
    { label: organization?.name || slug || 'Organization', href: `/organizations/${slug}` },
    { label: 'Nodes', href: `/organizations/${slug}/nodes` },
    { label: nodeIpsData?.node_name || nodeId || 'Node', href: `/organizations/${slug}/nodes/${nodeId}` },
    { label: 'IP Addresses' }
  ];

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading node IP addresses...</span>
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
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node IPs</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={fetchNodeIps} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!nodeIpsData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Network className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No IP Data Available</h2>
            <p className="text-gray-500">No IP address data found for this node.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Network className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Node IP Addresses</h1>
                  <p className="mt-1 text-sm text-gray-500-foreground">
                    {nodeIpsData.node_name} • {nodeIpsData.node_address}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <Button variant="outline" asChild>
                <Link to={`/organizations/${slug}/nodes/${nodeId}`}>
                  Back to Node
                </Link>
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mt-6 mb-6">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active-only"
                  checked={activeOnly}
                  onCheckedChange={handleActiveOnlyToggle}
                />
                <Label htmlFor="active-only" className="text-sm font-medium cursor-pointer">
                  Show active IPs only
                </Label>
              </div>
            </Card>
          </div>

          {/* IP Addresses Table */}
          <Card className="p-0">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                IP Addresses ({nodeIpsData.total})
              </h2>
              <p className="text-sm text-gray-500-foreground mt-1">
                {activeOnly ? 'Showing active IP addresses only' : 'Showing all IP addresses'}
              </p>
            </div>
            
            {nodeIpsData.node_ips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Network className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No IP Addresses Found</h3>
                <p className="text-sm text-gray-500">
                  {activeOnly ? 'No active IP addresses found for this node.' : 'No IP addresses found for this node.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolved At</TableHead>
                    <TableHead>Node ID</TableHead>
                    <TableHead>UUID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nodeIpsData.node_ips.map((nodeIp: NodeIp) => (
                    <TableRow key={nodeIp.uuid}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {nodeIp.active ? (
                            <Wifi className="h-4 w-4 text-green-500" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-mono text-sm">{nodeIp.ip_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={nodeIp.active ? 'success' : 'secondary'}>
                          {nodeIp.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(nodeIp.resolved_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{nodeIp.node_id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500">
                          {nodeIp.uuid}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NodeIps; 