import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';

const JsonViewer: React.FC<{ data: any }> = ({ data }) => (
  <pre className="overflow-x-auto bg-gray-100 dark:bg-gray-900 text-xs rounded p-4 mt-2 mb-2 max-h-96 whitespace-pre-wrap">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const OrgNodeScanDetail: React.FC = () => {
  const { slug, nodeId, scanId } = useParams<{ slug: string; nodeId: string; scanId: string }>();
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
        <div className="p-6 border text-center">Error Loading Scan: {error}</div>
      </div>
    );
  }

  const scan = (scanSessionsData?.scans || []).find((s: any) => s.scan_id === scanId);

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
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Scan Details</h1>
        {!scan ? (
          <div className="p-6 border text-center text-muted-foreground">Scan not found</div>
        ) : (
          <JsonViewer data={scan} />
        )}
      </div>
    </NodeMainLayout>
  );
};

export default OrgNodeScanDetail; 