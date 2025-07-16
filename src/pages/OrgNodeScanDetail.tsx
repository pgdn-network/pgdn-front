import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NodeApiService } from '@/api/nodes';
import ScanResultsPage from '@/components/ui/custom/ScanResultsPage';
import { DisputeModal, type DisputeData } from '@/components/ui/custom/DisputeModal';
import { apiService } from '@/services/api';


const OrgNodeScanDetail: React.FC = () => {
  const { slug, nodeId, scanId } = useParams<{ slug: string; nodeId: string; scanId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { addNotification } = useNotifications();
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeData, setDisputeData] = useState<{
    scanType: string;
    target: string;
    sessionId?: string;
  } | null>(null);
  const [isDisputeLoading, setIsDisputeLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  // Helper: get scan type from sessionDetail - handle both old and new formats
  const scanType = sessionDetail?.scan_type || 
                   sessionDetail?.scan_type_id || 
                   sessionDetail?.scan_type_name || 
                   (Array.isArray(sessionDetail?.scan_types) ? sessionDetail.scan_types[0] : '') || 
                   '';

  // Helper: open report generation modal
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  // Helper: generate report
  const handleGenerateReport = async () => {
    if (!organizationUuid || !nodeId || !scanId) return;
    
    // Close the modal immediately when starting the process
    setIsReportModalOpen(false);
    setIsReportLoading(true);
    
    try {
      const response = await apiService.post(
        `/organizations/${organizationUuid}/nodes/${nodeId}/sessions/${scanId}/reports`,
        { report_type: 'network' }
      );
      if (response.status < 200 || response.status >= 300) throw new Error('Failed to start report generation');
      addNotification({
        type: 'success',
        title: 'Report Generation Started',
        message: 'The deep discovery report is being generated. This may take up to a minute. You will see it in the reports tab when ready.',
        duration: 9000
      });
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = 'Could not start report generation. Please try again.';
      
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Failed to Start Report',
        message: errorMessage,
        duration: 6000
      });
    } finally {
      setIsReportLoading(false);
    }
  };

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!organizationUuid || !nodeId || !scanId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await NodeApiService.getNodeSessionDetail(organizationUuid, nodeId, scanId);
        setSessionDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetail();
  }, [organizationUuid, nodeId, scanId]);

  // Handle dispute functionality
  const handleOpenDispute = (scanType: string, target: string, sessionId?: string) => {
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

  return (
    <>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Scan Details</h1>
          <Link to={`/organizations/${slug}/nodes/${nodeId}/scans`} className="text-primary underline text-sm font-medium">&larr; Back to Scans</Link>
        </div>
        {!sessionDetail ? (
          <div className="p-6 border text-center text-muted-foreground">Session not found</div>
        ) : (
          <>
            <ScanResultsPage 
              scanData={sessionDetail} 
              onDispute={handleOpenDispute}
              onGenerateReport={handleOpenReportModal}
              isReportLoading={isReportLoading}
              canGenerateReport={scanType === 'deep_discovery'}
            />
          </>
        )}
      </div>
      {/* Generate Report Modal (inline, no external Modal) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Generate Deep Discovery Report</h2>
            </div>
            <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
              This will generate a new deep discovery report for this scan session.<br />
              <span className="font-medium">Note:</span> This process may take up to a minute. You can view the report in the Reports tab when it is ready.
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsReportModalOpen(false)} disabled={isReportLoading}>Cancel</Button>
              <Button onClick={handleGenerateReport} disabled={isReportLoading} className="bg-blue-700 hover:bg-blue-800 text-white">
                {isReportLoading ? 'Generating...' : 'Start Report Generation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
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
    </>
  );
};

export default OrgNodeScanDetail; 