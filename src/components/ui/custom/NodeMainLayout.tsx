import React from 'react';
import { NodeOverview } from '@/components/ui/custom/NodeOverview';
import { NodeScanTaskLoader } from '@/components/ui/custom/NodeScanTaskLoader';

interface NodeMainLayoutProps {
  node: any;
  organization: any;
  nodeId: string;
  slug: string;
  onStartScan: () => void;
  // Data props
  cveData: any;
  eventsData: any;
  scanSessionsData: any;
  reportsData: any;
  snapshotData: any;
  actionsData: any;
  loading: boolean;
  children?: React.ReactNode;
  // Task polling props
  tasks?: any[];
  totalTasks?: number;
}

export const NodeMainLayout: React.FC<NodeMainLayoutProps> = ({
  node,
  organization,
  nodeId,
  onStartScan,
  snapshotData,
  children,
  tasks = [],
  totalTasks = 0
}) => {
  return (
    <div className="min-h-screen bg-background">
      <NodeOverview 
        node={node} 
        organization={organization} 
        nodeId={nodeId} 
        onStartScan={onStartScan}
        snapshotData={snapshotData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scan Task Loader */}
        <div className="mb-4">
          <NodeScanTaskLoader remaining={tasks.length} total={totalTasks} />
        </div>
        {children}
      </div>
    </div>
  );
}; 