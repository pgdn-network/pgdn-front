import React from 'react';

interface NodeStatusCardProps {
  node: any;
  getProtocol: (uuid: string) => { display_name: string } | null;
}


export const NodeStatusCard: React.FC<NodeStatusCardProps> = ({ node, getProtocol }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {node.simple_state ? node.simple_state.charAt(0).toUpperCase() + node.simple_state.slice(1) : 'Unknown'}
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
        <span className="text-sm text-gray-900 dark:text-white">
          {Array.isArray(node.node_protocols) && node.node_protocols.length > 0
            ? node.node_protocols.map((uuid: string) => {
                const proto = getProtocol(uuid);
                return proto ? proto.display_name : 'Unknown';
              }).join(', ')
            : node.protocol_details?.display_name || 'Unknown'}
        </span>
      </div>
    </div>
  </div>
);