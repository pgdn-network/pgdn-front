import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNodeData } from '@/hooks/useNodeData';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';
import { DisputeModal, type DisputeData } from '@/components/ui/custom/DisputeModal';
import { useNotifications } from '@/contexts/NotificationContext';

const PAGE_LIMIT = 25;

const OrgNodeScans: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { addNotification } = useNotifications();
  const [page, setPage] = useState(1);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeData, setDisputeData] = useState<{
    scanType: string;
    target: string;
    sessionId?: string;
  } | null>(null);
  const [isDisputeLoading, setIsDisputeLoading] = useState(false);
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

  // Handle dispute functionality
  const handleOpenDispute = (sessionId: string, scanTypes: string[], target: string) => {
    const scanType = scanTypes.length > 0 ? scanTypes.join(', ') : 'unknown';
    setDisputeData({ scanType, target, sessionId });
    setIsDisputeModalOpen(true);
  };

  const handleCloseDispute = () => {
    setIsDisputeModalOpen(false);
    setDisputeData(null);
  };

  const handleSubmitDispute = async (disputeSubmission: DisputeData) => {
    setIsDisputeLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Dispute submitted:', disputeSubmission);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Dispute Submitted',
        message: `Your dispute for ${disputeSubmission.scanType} scan has been recorded. This is a prototype - no validation logic is implemented yet.`,
        duration: 8000
      });

      handleCloseDispute();
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      
      addNotification({
        type: 'error',
        title: 'Failed to Submit Dispute',
        message: 'Please try again or contact support if the problem persists.',
        duration: 5000
      });
    } finally {
      setIsDisputeLoading(false);
    }
  };

  return (
    <>
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
      <ScanSessionsCard 
        scanSessions={scanSessionsData?.scans || []} 
        slug={slug} 
        nodeId={nodeId} 
        onDispute={handleOpenDispute}
      />
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
      {disputeData && (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          onClose={handleCloseDispute}
          onSubmit={handleSubmitDispute}
          isLoading={isDisputeLoading}
          scanType={disputeData.scanType}
          target={disputeData.target}
          sessionId={disputeData.sessionId}
        />
      )}
    </NodeMainLayout>
    </>
  );
};

export default OrgNodeScans;