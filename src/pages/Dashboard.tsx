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
  Eye
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOrg = searchParams.get('org') || 'all';
  
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
        // Get JWT token using the proper storage utility
        const token = storage.getAccessToken();
        
        if (!token) {
          console.error('No access token found. User may need to log in.');
          return;
        }
        
        let url: string;
        if (selectedOrg && selectedOrg !== 'all') {
          // Organization-specific API call
          url = `http://localhost:8000/api/v1/organizations/${selectedOrg}/nodes?limit=50&offset=0`;
        } else {
          // General nodes API call
          url = 'http://localhost:8000/api/v1/nodes?limit=50&offset=0';
        }

        console.log('Fetching nodes from:', url);

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
        console.log('Nodes data received:', data);
        
        // TODO: Update state with fetched data instead of using mock data
        
      } catch (error) {
        console.error('Error fetching nodes:', error);
      }
    };

    fetchNodes();
  }, [selectedOrg]); // Re-fetch when organization filter changes
  
  // Mock organizations data
  const organizations = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'PGDN Global' },
    { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', name: 'PGDN Europe' },
    { id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', name: 'PGDN Asia' },
    { id: '6ba7b812-9dad-11d1-80b4-00c04fd430c8', name: 'PGDN Americas' },
  ];
  
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

  // Enhanced mock data for recent nodes with more details
  const recentNodes = [
    {
      id: 'node-1',
      name: 'DePIN Node Alpha',
      type: 'Storage',
      status: 'online' as const,
      location: 'New York, NY',
      uptime: '99.9%',
      lastSeen: '2 minutes ago',
      performance: 95,
      resources: '85% CPU, 67% Memory'
    },
    {
      id: 'node-2',
      name: 'DePIN Node Beta',
      type: 'Compute',
      status: 'online' as const,
      location: 'San Francisco, CA',
      uptime: '98.7%',
      lastSeen: '1 minute ago',
      performance: 88,
      resources: '72% CPU, 54% Memory'
    },
    {
      id: 'node-3',
      name: 'DePIN Node Gamma',
      type: 'Network',
      status: 'offline' as const,
      location: 'Austin, TX',
      uptime: '95.2%',
      lastSeen: '2 hours ago',
      performance: 0,
      resources: 'N/A'
    },
    {
      id: 'node-4',
      name: 'DePIN Node Delta',
      type: 'Storage',
      status: 'degraded' as const,
      location: 'Miami, FL',
      uptime: '99.5%',
      lastSeen: '30 seconds ago',
      performance: 67,
      resources: '92% CPU, 78% Memory'
    },
    {
      id: 'node-5',
      name: 'DePIN Node Echo',
      type: 'Compute',
      status: 'online' as const,
      location: 'Seattle, WA',
      uptime: '99.8%',
      lastSeen: '45 seconds ago',
      performance: 92,
      resources: '68% CPU, 45% Memory'
    }
  ];

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
          <Select value={selectedOrg} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-[200px] !bg-white dark:!bg-gray-800">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-secondary flex items-center justify-center">
                        <Server className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <Link 
                          to={`/organizations/550e8400-e29b-41d4-a716-446655440000/nodes/${node.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {node.name}
                        </Link>
                        <p className="text-xs text-muted">ID: {node.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{node.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusDot status={node.status} />
                      <span className="capitalize text-sm">{node.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3 text-muted" />
                      {node.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{node.uptime}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3 text-muted" />
                      {node.lastSeen}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-secondary h-2">
                        <div 
                          className="h-2 bg-secondary"
                          style={{ width: `${node.performance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{node.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/organizations/550e8400-e29b-41d4-a716-446655440000/nodes/${node.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
