import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { StatusDot } from '@/components/ui/custom/StatusDot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Loader from '@/components/ui/custom/Loader';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Server, 
  XCircle,
  Globe,
  Clock,
  Eye,
  Plus,
  Lock,
  LockOpen,
  AlertTriangle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { NodeApiService } from '@/api/nodes';
import type { Node } from '@/types/node';

// Extend Node type to include protocols array for Dashboard context
interface DashboardNode extends Node {
  protocols?: string[];
}

// Score grading function (same as NodeSnapshotCard)
const getScoreGrade = (score: number | null): { grade: string; color: string } => {
  if (score === null) return { grade: 'N/A', color: 'bg-gray-100 text-gray-800' };
  
  if (score >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
  if (score >= 80) return { grade: 'B', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' };
  if (score >= 65) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
  if (score >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
  return { grade: 'F', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrg = searchParams.get('org') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [nodes, setNodes] = useState<Node[]>([]);
  const [totalNodes, setTotalNodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(50); // Items per page
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { loading: protocolsLoading, getProtocol } = useProtocols();
  const { user } = useAuth();
  
  const handleOrgChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('org', value);
    setSearchParams(newParams);
    setCurrentPage(1); // Reset to first page when changing organization
  };

  // Fetch nodes based on selected organization
  useEffect(() => {
    // Don't fetch if organizations are still loading
    if (orgsLoading) return;
    
    const fetchNodes = async () => {
      setNodesLoading(true);
      try {
        let nodesResponse: { nodes: Node[], total: number } = { nodes: [], total: 0 };
        const offset = (currentPage - 1) * pageLimit;

        if (selectedOrg && selectedOrg !== 'all') {
          // Find organization UUID from slug using cached organizations
          const org = organizations.find(org => org.slug === selectedOrg);
          if (org) {
            // Organization-specific API call using UUID
            nodesResponse = await NodeApiService.getNodes(org.uuid, pageLimit, offset, searchQuery);
          } else {
            console.warn(`Organization with slug "${selectedOrg}" not found in cache. Skipping nodes fetch.`);
            setNodes([]); // Clear nodes if org not found
            setTotalNodes(0);
            setNodesLoading(false);
            return; // Guard clause: do not call API with empty orgId
          }
        } else {
          // No org selected or 'all' selected, call global endpoint
          nodesResponse = await NodeApiService.getNodes('', pageLimit, offset, searchQuery);
        }
        // Update state with fetched nodes data
        if (nodesResponse.nodes && Array.isArray(nodesResponse.nodes)) {
          // Map node_protocols to protocols for Dashboard compatibility
          const mappedNodes = nodesResponse.nodes.map((node: any) => {
            if (Array.isArray(node.node_protocols)) {
              return { ...node, protocols: node.node_protocols };
            }
            return node;
          });
          setNodes(mappedNodes);
          setTotalNodes(nodesResponse.total || 0);
        }
      } catch (error) {
        console.error('Error fetching nodes:', error);
      } finally {
        setNodesLoading(false);
      }
    };

    fetchNodes();
  }, [selectedOrg, organizations, orgsLoading, currentPage, pageLimit, searchQuery]); // Re-fetch when page or search changes

  // Update loading state when all API calls complete
  useEffect(() => {
    setLoading(nodesLoading || orgsLoading || protocolsLoading);
  }, [nodesLoading, orgsLoading, protocolsLoading]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // getProtocol is now provided by the ProtocolsContext

  // Helper function to get organization slug by UUID
  const getOrgSlug = (orgUuid: string): string => {
    const org = organizations.find(org => org.uuid === orgUuid);
    return org?.slug || orgUuid; // Fallback to UUID if slug not found
  };

  // WebSocket notifications are automatically handled by the WebSocketProvider

  // Helper function to get icon and color based on simple_state
  const getStateIcon = (simpleState: string | null | undefined) => {
    const state = (simpleState || 'new').toLowerCase();
    
    switch (state) {
      case 'authorized':
        return {
          icon: Lock,
          color: 'text-green-600',
          label: 'Authorized'
        };
      case 'unauthorized':
      case 'denied':
        return {
          icon: LockOpen,
          color: 'text-red-500',
          label: 'Unauthorized'
        };
      case 'pending':
      case 'processing':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          label: 'Pending'
        };
      case 'error':
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          label: 'Error'
        };
      case 'inactive':
      case 'disabled':
        return {
          icon: XCircle,
          color: 'text-gray-500',
          label: 'Inactive'
        };
      case 'new':
        return {
          icon: Server,
          color: 'text-blue-500',
          label: 'New'
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-400',
          label: simpleState || 'Unknown'
        };
    }
  };
  
  // Determine if we should show no nodes page
  const shouldShowNoNodesPage = !loading && !orgsLoading && nodes.length === 0;
  

  // Show loading state while data is being fetched
  if (loading || orgsLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
            <p className="text-lg text-secondary">Welcome back, <span className="font-semibold text-accent">{user?.first_name || 'User'}</span></p>
            <p className="text-muted max-w-2xl mt-2">Monitor your DePIN network performance, track node health, and manage your decentralized infrastructure from one central hub.</p>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex flex-col items-center justify-center py-20">
          <Loader size="lg" className="mb-4" />
          <p className="text-lg text-secondary">Loading your dashboard...</p>
          <p className="text-sm text-muted mt-2">Fetching nodes and organizations</p>
        </div>
      </div>
    );
  }

  // Show no nodes page if no nodes and not filtered
  if (shouldShowNoNodesPage) {
    return (
      <div className="space-y-6">
        {/* No Nodes State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-surface-secondary flex items-center justify-center mb-6">
            <Server className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Welcome to PGDN</h1>
          <p className="text-lg text-secondary mb-2 text-center max-w-md">
            You haven't added any nodes to your network yet. Get started by creating your first node.
          </p>
          <p className="text-sm text-muted mb-8 text-center max-w-md">
            Nodes are the core components of your DePIN network. They help process transactions, store data, and maintain network security.
          </p>
          <Button 
            onClick={() => navigate('/nodes/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Node
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-lg text-secondary">Welcome back, <span className="font-semibold text-accent">{user?.first_name || 'User'}</span></p>
          <p className="text-muted max-w-2xl mt-2">Monitor your DePIN network performance, track node health, and manage your decentralized infrastructure from one central hub.</p>
        </div>
      </div>

      {/* Stats Grid 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="flex flex-col items-start gap-2">
            <CardContent className="w-full flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">{stat.title}</p>
                  <p className="text-sm text-secondary">{stat.description}</p>
                </div>
              </div>
              <p className="text-3xl font-black text-primary leading-none">{stat.value}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {stat.trend === 'up' ? '↗' : '↘'}
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Table Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Globe className="w-5 h-5 text-secondary" />
            {searchQuery && searchQuery.length >= 3 ? `Search Results for "${searchQuery}"` : 'Network Nodes'}
          </h2>
          {organizations.length > 1 && (
            <Select value={selectedOrg} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-[200px] !bg-white dark:!bg-gray-800">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.uuid} value={org.slug}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Simple State</TableHead>
                <TableHead>Discovery Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(nodes as DashboardNode[]).map((node) => {
                // Prefer node.protocols array if present and non-empty
                let protocolDisplay = null;
                if (Array.isArray(node.protocols) && node.protocols.length > 0) {
                  const protocolNames = node.protocols.map((uuid: string) => {
                    const proto = getProtocol(uuid);
                    return proto ? proto.display_name : 'Unknown protocol';
                  });
                  protocolDisplay = (
                    <>
                      <div className="font-medium text-sm">{protocolNames.join(', ')}</div>
                    </>
                  );
                } else if (node.protocol_details?.uuid) {
                  const proto = getProtocol(node.protocol_details.uuid);
                  protocolDisplay = proto ? (
                    <>
                      <div className="font-medium text-sm">{proto.display_name}</div>
                      <div className="text-xs text-muted">{proto.category.replace(/_/g, ' ')}</div>
                    </>
                  ) : (
                    <div className="text-xs text-muted">Unknown protocol</div>
                  );
                } else {
                  protocolDisplay = <div className="text-sm text-muted">—</div>;
                }
                const stateInfo = getStateIcon(node.simple_state);
                const StateIcon = stateInfo.icon;
                
                return (
                  <TableRow key={node.uuid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 bg-surface-secondary flex items-center justify-center cursor-help"
                          title={`State: ${stateInfo.label}`}
                        >
                          <StateIcon className={`w-4 h-4 ${stateInfo.color} ${stateInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <Link 
                            to={`/organizations/${getOrgSlug(node.organization_uuid)}/nodes/${node.uuid}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {node.name}
                          </Link>
                          <p className="text-xs text-muted">{node.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {protocolDisplay}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot status={node.active ? 'online' : 'offline'} />
                        <span className="capitalize text-sm">{node.simple_state || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{node.discovery_status || 'Unknown'}</span>
                    </TableCell>
                    <TableCell>
                      {node.snapshot?.latest_score !== null && node.snapshot?.latest_score !== undefined ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full cursor-help ${getScoreGrade(node.snapshot.latest_score).color}`}>
                                {getScoreGrade(node.snapshot.latest_score).grade}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Security Score: {node.snapshot.latest_score}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted" />
                        {node.snapshot?.latest_scan_date ? (
                          <span>{new Date(node.snapshot.latest_scan_date).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/organizations/${getOrgSlug(node.organization_uuid)}/nodes/${node.uuid}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
        
        {/* Pagination Controls */}
        {totalNodes > pageLimit && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {currentPage} of {Math.ceil(totalNodes / pageLimit)} 
              ({totalNodes} {searchQuery && searchQuery.length >= 3 ? `result${totalNodes !== 1 ? 's' : ''} for "${searchQuery}"` : 'total nodes'})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalNodes / pageLimit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
