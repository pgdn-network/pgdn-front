import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';

const OrgNodeScans: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const {
    node,
    organization,
    scanSessionsData,
    snapshotData,
    loading,
    error
  } = useNodeData(
    organizations.find(org => org.slug === slug)?.uuid || '',
    nodeId || ''
  );

  if (loading || orgsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-6 border text-center">Error Loading Scans: {error}</div>
      </div>
    );
  }

  return (
    <NodeMainLayout
      node={node}
      organization={organization}
      nodeId={nodeId || ''}
      slug={slug || ''}
      onStartScan={() => {}}
      cveData={null}
      eventsData={null}
      interventionsData={null}
      scanSessionsData={scanSessionsData}
      reportsData={null}
      snapshotData={snapshotData}
      loading={loading}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            Scans
          </h1>
          <p className="text-secondary max-w-2xl">All scan sessions for this node</p>
        </div>
      </div>
      <ScanSessionsCard scanSessions={scanSessionsData?.scans || []} />
    </NodeMainLayout>
  );
};

export default OrgNodeScans; 