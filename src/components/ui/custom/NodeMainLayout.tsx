import React from 'react';
import { CVECard } from '@/components/ui/custom/CVECard';
import { EventCard } from '@/components/ui/custom/EventCard';
import { ReportsCard } from '@/components/ui/custom/ReportsCard';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';
import { NodeSnapshotCard } from '@/components/ui/custom/NodeSnapshotCard';
import { NodeOverview } from '@/components/ui/custom/NodeOverview';
import { NodeActivity } from '@/components/ui/custom/NodeActivity';
import { NodeOrganizationContext } from '@/components/ui/custom/NodeOrganizationContext';
import { NodeInterventions } from '@/components/ui/custom/NodeInterventions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NodeMainLayoutProps {
  node: any;
  organization: any;
  nodeId: string;
  slug: string;
  onStartScan: () => void;
  // Data props
  cveData: any;
  eventsData: any;
  interventionsData: any;
  scanSessionsData: any;
  reportsData: any;
  snapshotData: any;
  loading: boolean;
  children?: React.ReactNode;
}

export const NodeMainLayout: React.FC<NodeMainLayoutProps> = ({
  node,
  organization,
  nodeId,
  slug,
  onStartScan,
  cveData,
  eventsData,
  interventionsData,
  scanSessionsData,
  reportsData,
  snapshotData,
  loading,
  children
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
        {children}
      </div>
    </div>
  );
}; 