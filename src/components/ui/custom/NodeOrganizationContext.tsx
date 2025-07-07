import React from 'react';

interface NodeOrganizationContextProps {
  node: any;
  organization: any;
  slug: string;
}

export const NodeOrganizationContext: React.FC<NodeOrganizationContextProps> = ({ 
  node, 
  organization, 
  slug 
}) => {
  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Organization Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Details</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Name: {organization?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Slug: {slug}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Nodes: {node.total_scan_sessions || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Role</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Role: {node.protocol_details?.display_name || 'Unknown'} Node</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assigned: {new Date(node.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Priority: {node.status === 'active' ? 'High' : 'Normal'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 