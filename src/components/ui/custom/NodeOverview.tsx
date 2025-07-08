import React from 'react';
import { Button } from '@/components/ui/button';

interface NodeOverviewProps {
  node: any;
  organization: any;
  nodeId: string;
  onStartScan: () => void;
}

export const NodeOverview: React.FC<NodeOverviewProps> = ({ 
  node, 
  organization, 
  nodeId, 
  onStartScan 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {organization?.name} - Node: {node.name}
          </h1>
          <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
            Detailed information and metrics for this node in {organization?.name}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button 
            onClick={onStartScan}
            disabled={!(node.simple_state === 'active' && node.discovery_status === 'completed')}
          >
            Start Scan
          </Button>
          <Button variant="outline">
            Settings
          </Button>
        </div>
      </div>
      
      {/* Node Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Node Status Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {node.status ? node.status.charAt(0).toUpperCase() + node.status.slice(1) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">State:</span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {node.simple_state || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Validated:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                node.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {node.validated ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Ready for Scan:</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                (node.simple_state === 'active' && node.discovery_status === 'completed') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {(node.simple_state === 'active' && node.discovery_status === 'completed') ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
              <span className="text-sm text-gray-900 dark:text-white">{node.protocol_details?.display_name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last Seen:</span>
              <span className="text-sm text-gray-900 dark:text-white">{new Date(node.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Node Metrics Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">CPU Usage:</span>
              <span className="text-sm text-gray-900 dark:text-white">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Memory:</span>
              <span className="text-sm text-gray-900 dark:text-white">2.1GB / 4GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Storage:</span>
              <span className="text-sm text-gray-900 dark:text-white">120GB / 500GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Network:</span>
              <span className="text-sm text-gray-900 dark:text-white">1.2 Mbps</span>
            </div>
          </div>
        </div>
        
        {/* Node Info Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Node ID:</span>
              <span className="text-sm text-gray-900 dark:text-white">{nodeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">IP Address:</span>
              <span className="text-sm text-gray-900 dark:text-white">{node.resolved_ips.length > 0 ? node.resolved_ips[0].ip_address : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Port:</span>
              <span className="text-sm text-gray-900 dark:text-white">{node.protocol_details?.ports?.length > 0 ? node.protocol_details.ports[0] : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
              <span className="text-sm text-gray-900 dark:text-white">{node.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Version:</span>
              <span className="text-sm text-gray-900 dark:text-white">v1.2.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 