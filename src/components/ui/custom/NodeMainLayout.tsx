import React from 'react';
import { NodeOverview } from '@/components/ui/custom/NodeOverview';

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
  tasksLoading?: boolean;
  scanJustStarted?: boolean;
  scanCompleted?: boolean;
}

export const NodeMainLayout: React.FC<NodeMainLayoutProps> = ({
  node,
  organization,
  nodeId,
  onStartScan,
  snapshotData,
  children,
  tasks = [],
  tasksLoading = false,
  scanJustStarted = false,
  scanCompleted = false
}) => {
  return (
    <div className="min-h-screen bg-background">
      <NodeOverview 
        node={node} 
        organization={organization} 
        nodeId={nodeId} 
        onStartScan={onStartScan}
        snapshotData={snapshotData}
        tasks={tasks}
        tasksLoading={tasksLoading}
        scanJustStarted={scanJustStarted}
        scanCompleted={scanCompleted}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}; 