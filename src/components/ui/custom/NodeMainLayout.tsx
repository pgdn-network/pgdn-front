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
  loading
}) => {
  return (
    <div className="min-h-screen bg-background">
      <NodeOverview 
        node={node} 
        organization={organization} 
        nodeId={nodeId} 
        onStartScan={onStartScan}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NodeActivity node={node} organization={organization} />
        
        <NodeOrganizationContext node={node} organization={organization} slug={slug} />
        
        {/* Node Snapshot Section */}
        <div className="mt-8">
          <NodeSnapshotCard snapshot={snapshotData} loading={loading} />
        </div>
        
        {/* CVE Details Section */}
        <div className="mt-8">
          <CVECard cves={cveData} organizationSlug={slug} nodeId={nodeId} />
        </div>

        {/* Events Section */}
        <div className="mt-8">
          <EventCard events={eventsData?.events} />
        </div>

        {/* Interventions Section */}
        <NodeInterventions interventionsData={interventionsData} />

        {/* Scan Sessions Section */}
        <div className="mt-8">
          <ScanSessionsCard scanSessions={scanSessionsData?.scans} />
        </div>

        {/* Reports Section */}
        <div className="mt-8">
          <ReportsCard 
            reports={reportsData?.reports || []} 
            organizationSlug={slug}
            nodeId={nodeId}
          />
        </div>
      </div>
    </div>
  );
}; 