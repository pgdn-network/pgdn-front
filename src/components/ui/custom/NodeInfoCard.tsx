import React from 'react';

interface NodeInfoCardProps {
  node: any;
  snapshotData: any;
}

export const NodeInfoCard: React.FC<NodeInfoCardProps> = ({ node, snapshotData }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Information</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">IP Address(es):</span>
        <span className="text-sm text-gray-900 dark:text-white">
          {node.resolved_ips.length === 0 && 'N/A'}
          {node.resolved_ips.length > 0 && (
            <>
              {node.resolved_ips.slice(0, 3).map((ip: any, idx: number) => (
                <span key={ip.ip_address}>
                  {ip.ip_address}{idx < Math.min(2, node.resolved_ips.length - 1) ? ', ' : ''}
                </span>
              ))}
              {node.resolved_ips.length > 3 && (
                <span className="ml-1 text-xs text-blue-600 underline cursor-pointer">+{node.resolved_ips.length - 3} more</span>
              )}
            </>
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Geo Location:</span>
        <span className="text-sm text-gray-900 dark:text-white">{snapshotData?.geo_location || 'N/A'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Hostname:</span>
        <span className="text-sm text-gray-900 dark:text-white">{node.address}</span>
      </div>
      {/* TODO: Harcoded version for now, add version from node */}
      <div className="flex justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Version:</span>
        <span className="text-sm text-gray-900 dark:text-white">v1.2.3</span>
      </div>
    </div>
  </div>
); 