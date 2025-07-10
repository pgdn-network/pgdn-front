import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';

// Simple JSON viewer component
const JsonViewer: React.FC<{ data: any }> = ({ data }) => (
  <pre className="overflow-x-auto bg-gray-100 dark:bg-gray-900 text-xs rounded p-4 mt-2 mb-2 max-h-96 whitespace-pre-wrap">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const PAGE_LIMIT = 25;

const OrgNodeScans: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_LIMIT;
  const {
    node,
    organization,
    scanSessionsData,
    snapshotData,
    loading,
    error
  } = useNodeData(
    organizations.find(org => org.slug === slug)?.uuid || '',
    nodeId || '',
    PAGE_LIMIT,
    offset
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
      scanSessionsData={scanSessionsData}
      reportsData={null}
      snapshotData={snapshotData}
      actionsData={null}
      loading={loading}
    >
      <ScanSessionsCard scanSessions={scanSessionsData?.scans || []} slug={slug} nodeId={nodeId} />
      {/* Pagination Controls */}
      {scanSessionsData && scanSessionsData.total > PAGE_LIMIT && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-3 py-1 rounded border bg-surface-secondary disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(scanSessionsData.total / PAGE_LIMIT)}</span>
          <button
            className="px-3 py-1 rounded border bg-surface-secondary disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(scanSessionsData.total / PAGE_LIMIT)}
          >
            Next
          </button>
        </div>
      )}
    </NodeMainLayout>
  );
};

export default OrgNodeScans; 