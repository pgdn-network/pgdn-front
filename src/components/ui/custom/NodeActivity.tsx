import React from 'react';

interface NodeActivityProps {
  node: any;
  organization: any;
}

export const NodeActivity: React.FC<NodeActivityProps> = ({ node, organization }) => {
  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4">
            <p className="text-sm text-gray-900 dark:text-white">Node created successfully</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.created_at).toLocaleDateString()}</p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <p className="text-sm text-gray-900 dark:text-white">Health check passed</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.updated_at).toLocaleDateString()}</p>
          </div>
          <div className="border-l-4 border-yellow-400 pl-4">
            <p className="text-sm text-gray-900 dark:text-white">Storage usage normal</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.updated_at).toLocaleDateString()}</p>
          </div>
          <div className="border-l-4 border-purple-400 pl-4">
            <p className="text-sm text-gray-900 dark:text-white">Assigned to organization: {organization?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 