import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/custom/Card';
import { StatusDot } from '@/components/ui/custom/StatusDot';
import { Badge } from '@/components/ui/custom/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loader from '@/components/ui/custom/Loader';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { mockUser } from '@/mocks/user';
import { storage } from '@/utils/storage';
import { 
  Server, 
  Shield, 
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  MapPin,
  Eye,
  Plus,
  Lock,
  LockOpen,
  AlertTriangle,
  Loader2,
  HelpCircle
} from 'lucide-react';

interface Protocol {
  uuid: string;
  name: string;
  display_name: string;
  category: string;
}

interface Node {
  uuid: string;
  name: string;
  address: string;
  active: boolean;
  current_state: string | null;
  meta: Record<string, unknown>;
  organization_uuid: string;
  protocol_uuid: string | null;
  protocol_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrg = searchParams.get('org') || 'all';
  const [protocols, setProtocols] = React.useState<Protocol[]>([]);
  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nodesLoading, setNodesLoading] = React.useState(true);
  const { organizations, loading: orgsLoading } = useOrganizations();
  
  const handleOrgChange = (value: string) => {
    if (value === 'all') {
      searchParams.delete('org');
    } else {
      searchParams.set('org', value);
    }
    setSearchParams(searchParams);
  };


  // Fetch nodes data from API
  React.useEffect(() => {
    const fetchNodes = async () => {
      try {
        setNodesLoading(true);
        // Get JWT token using the proper storage utility
        const token = storage.getAccessToken();
        
        if (!token) {
          console.error('No access token found. User may need to log in.');
          return;
        }
        
        let url: string;
        if (selectedOrg && selectedOrg !== 'all') {
          // Organization-specific API call using slug
          url = `http://localhost:8000/api/v1/organizations/${selectedOrg}/nodes?limit=50&offset=0`;
        } else {
          // General nodes API call
          url = 'http://localhost:8000/api/v1/nodes?limit=50&offset=0';
        }

        const response = await fetch(url, {
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update state with fetched nodes data
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
        }
        
      } catch (error) {
        console.error('Error fetching nodes:', error);
      } finally {
        setNodesLoading(false);
      }
    };

    fetchNodes();
  }, [selectedOrg]); // Re-fetch when organization filter changes

  // Update loading state when both API calls complete
  React.useEffect(() => {
    setLoading(nodesLoading || orgsLoading);
  }, [nodesLoading, orgsLoading]);

  // Fetch protocols data from API
  React.useEffect(() => {
    const fetchProtocols = async () => {
      try {
        // Get JWT token using the proper storage utility
        const token = storage.getAccessToken();
        
        if (!token) {
          console.error('No access token found for protocols request. User may need to log in.');
          return;
        }

        const url = 'http://localhost:8000/api/v1/protocols';
        console.log('Fetching protocols from:', url);

        const response = await fetch(url, {
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Protocol[] = await response.json();
        console.log('Protocols data received:', data);
        setProtocols(data);
        
      } catch (error) {
        console.error('Error fetching protocols:', error);
      }
    };

    fetchProtocols();
  }, []); // Fetch protocols once on component mount

  // Create protocol lookup map for efficiency
  const protocolMap = React.useMemo(() => {
    const map = new Map<string, Protocol>();
    protocols.forEach(protocol => {
      map.set(protocol.uuid, protocol);
    });
    return map;
  }, [protocols]);

  // Helper function to get protocol info by UUID
  const getProtocol = (protocolUuid: string | null): Protocol | null => {
    if (!protocolUuid) return null;
    return protocolMap.get(protocolUuid) || null;
  };

  // Helper function to get organization slug by UUID
  const getOrgSlug = (orgUuid: string): string => {
    const org = organizations.find(org => org.uuid === orgUuid);
    return org?.slug || orgUuid; // Fallback to UUID if slug not found
  };

  // Helper function to get icon and color based on current_state
  const getStateIcon = (currentState: string | null | undefined) => {
    const state = (currentState || 'new').toLowerCase();
    
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
          label: currentState || 'Unknown'
        };
    }
  };
  
  // Determine if we should show no nodes page
  const shouldShowNoNodesPage = !loading && nodes.length === 0;
  
  // Mock data for stats with enhanced visual indicators
  const stats = [
    {
      title: 'Total Nodes',
      value: '247',
      change: '+12%',
      icon: Server,
      trend: 'up',
      description: 'Active network nodes'
    },
    {
      title: 'Online Nodes',
      value: '231',
      change: '+5%',
      icon: CheckCircle,
      trend: 'up',
      description: 'Healthy and responding'
    },
    {
      title: 'Offline Nodes',
      value: '16',
      change: '-8%',
      icon: XCircle,
      trend: 'down',
      description: 'Require attention'
    },
    {
      title: 'Security Score',
      value: '98.5%',
      change: '+2%',
      icon: Shield,
      trend: 'up',
      description: 'Network security rating'
    }
  ];


  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
            <p className="text-lg text-secondary">Welcome back, <span className="font-semibold text-accent">{mockUser.name.split(' ')[0]}</span></p>
            <p className="text-muted max-w-2xl mt-2">Monitor your DePIN network performance, track node health, and manage your decentralized infrastructure from one central hub.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Network Status</span>
            <StatusDot status="online" />
            <span className="text-success font-semibold">All Systems Operational</span>
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
          <p className="text-lg text-secondary">Welcome back, <span className="font-semibold text-accent">{mockUser.name.split(' ')[0]}</span></p>
          <p className="text-muted max-w-2xl mt-2">Monitor your DePIN network performance, track node health, and manage your decentralized infrastructure from one central hub.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Network Status</span>
          <StatusDot status="online" />
          <span className="text-success font-semibold">All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="flex flex-col items-start gap-2">
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
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Globe className="w-5 h-5 text-secondary" />
            Network Nodes
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
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Last Scan</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.map((node) => {
                const protocol = getProtocol(node.protocol_uuid);
                const stateInfo = getStateIcon(node.current_state);
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
                        {protocol ? (
                          <>
                            <div className="font-medium text-sm">{protocol.display_name}</div>
                            <div className="text-xs text-muted">{protocol.category.replace(/_/g, ' ')}</div>
                          </>
                        ) : (
                          <div className="text-xs text-muted">No protocol assigned</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot status={node.active ? 'online' : 'offline'} />
                        <span className="capitalize text-sm">{node.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted" />
                        <span className="text-muted">Not available</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">Not available</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-muted" />
                        <span className="text-muted">Not available</span>
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
      </div>
    </div>
  );
};

export default Dashboard;
