import React from 'react';
import { useParams } from 'react-router-dom';
import { Server, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  
  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';
  const { node, loading, error, refetch } = useNodeData(organizationUuid, nodeId || '');
  

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading node data...</span>
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
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Server className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Node Not Found</h2>
            <p className="text-gray-500">The requested node could not be found.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">{organization?.name} - Node: {node.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Detailed information and metrics for this node in {organization?.name}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Start Scan
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Settings
            </button>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Status Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Node Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Organization:</span>
                <span className="text-sm text-gray-900">{organization?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Type:</span>
                <span className="text-sm text-gray-900">{node.protocol_details.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Seen:</span>
                <span className="text-sm text-gray-900">{new Date(node.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Uptime:</span>
                <span className="text-sm text-gray-900">{node.status === 'active' ? '99.8%' : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Node Metrics Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">CPU Usage:</span>
                <span className="text-sm text-gray-900">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Memory:</span>
                <span className="text-sm text-gray-900">2.1GB / 4GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Storage:</span>
                <span className="text-sm text-gray-900">120GB / 500GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Network:</span>
                <span className="text-sm text-gray-900">1.2 Mbps</span>
              </div>
            </div>
          </div>
          
          {/* Node Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Node Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Node ID:</span>
                <span className="text-sm text-gray-900">{nodeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IP Address:</span>
                <span className="text-sm text-gray-900">{node.resolved_ips.length > 0 ? node.resolved_ips[0].ip_address : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Port:</span>
                <span className="text-sm text-gray-900">{node.protocol_details.ports.length > 0 ? node.protocol_details.ports[0] : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Location:</span>
                <span className="text-sm text-gray-900">{node.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Version:</span>
                <span className="text-sm text-gray-900">v1.2.3</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-900">Node created successfully</p>
                <p className="text-xs text-gray-500">{new Date(node.created_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-900">Health check passed</p>
                <p className="text-xs text-gray-500">{new Date(node.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-sm text-gray-900">Storage usage normal</p>
                <p className="text-xs text-gray-500">{new Date(node.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-sm text-gray-900">Assigned to organization: {organization?.name}</p>
                <p className="text-xs text-gray-500">{new Date(node.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Organization Context */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Organization Details</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Name: {organization?.name}</p>
                  <p className="text-sm text-gray-600">Slug: {slug}</p>
                  <p className="text-sm text-gray-600">Total Nodes: {node.total_scan_sessions || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Node Role</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Role: {node.protocol_details.display_name} Node</p>
                  <p className="text-sm text-gray-600">Assigned: {new Date(node.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Priority: {node.status === 'active' ? 'High' : 'Normal'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add organization-specific node configuration */}
        {/* TODO: Add node transfer between organizations */}
        {/* TODO: Add organization-specific alerts */}
        {/* TODO: Add node role management within organization */}
      </div>
    </div>
  );
};

export default OrgNodeDetail;
