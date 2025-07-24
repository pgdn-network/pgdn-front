import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Server, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/custom/EventCard';
import { NodeSnapshotCard } from '@/components/ui/custom/NodeSnapshotCard';
import { NodeActionsCard } from '@/components/ui/custom/NodeActionsCard';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';
import { CVECard } from '@/components/ui/custom/CVECard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import { ValidationModal } from '@/components/ui/custom/ValidationModal';
import { DiscoveryResultsModal } from '@/components/ui/custom/DiscoveryResultsModal';
import { DisputeModal, type DisputeData } from '@/components/ui/custom/DisputeModal';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { NodeOnboardingLayout } from '@/components/ui/custom/NodeOnboardingLayout';

import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useBanner } from '@/contexts/BannerContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { NodeApiService } from '@/api/nodes';
import { useBasicNodeData, useNodeAdditionalData } from '@/hooks/useNodeData';
import { scanTracker } from '@/services/scanTracker';
import { hasDiscoveryModalBeenShown, markDiscoveryModalAsShown } from '@/utils/discoveryModalTracking';
import { useNodeDiscoverySubscription } from '@/hooks/useWebSocketSubscription';
import { useNodeScansPolling } from '@/hooks/useNodeScansPolling';


import { NodeStatusCard } from '@/components/ui/custom/NodeStatusCard';
import { NodeInfoCard } from '@/components/ui/custom/NodeInfoCard';

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Helper function to count running scans (all returned scans are running)
  const getRemainingScansCount = (scans: any[]) => {
    return scans.length; // All scans returned are running scans
  };
  
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDiscoveryResultsModalOpen, setIsDiscoveryResultsModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeData, setDisputeData] = useState<{
    scanType: string;
    target: string;
    sessionId?: string;
  } | null>(null);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [isDisputeLoading, setIsDisputeLoading] = useState(false);
  const [scanJustStarted, setScanJustStarted] = useState(false);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);
  const { setBanner } = useBanner();
  const { addNotification, updateNotification } = useNotifications();
  const { getProtocol } = useProtocols();
  
  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';
  
  // Use basic node data first to determine node state
  const { 
    node: basicNode, 
    loading: basicLoading, 
    error: basicError,
    refetch: basicRefetch 
  } = useBasicNodeData(organizationUuid, nodeId || '');

  // Only use additional data if node is active and discovery is completed
  const shouldUseAdditionalData = basicNode?.simple_state === 'active' && basicNode?.discovery_status === 'completed';
  
  const { 
    cveData,
    eventsData, 
    scanSessionsData, 
    reportsData,
    snapshotData,
    actionsData,
    loading: additionalLoading, 
    error: additionalError, 
    refetch: additionalRefetch 
  } = useNodeAdditionalData(shouldUseAdditionalData ? basicNode : null, organizationUuid, nodeId || '');

  // Use the basic node data and combine with additional data
  const node = basicNode;
  const loading = basicLoading || (shouldUseAdditionalData && additionalLoading);
  const error = basicError || additionalError;
  const refetch = shouldUseAdditionalData ? additionalRefetch : basicRefetch;

  // Poll for running scan sessions every 15 seconds
  const { scans, loading: scansLoading, refresh: refreshScans } = useNodeScansPolling(organizationUuid, nodeId || '');

  // Listen for WebSocket messages and refresh tasks when scan completes
  const discoveryMessage = useNodeDiscoverySubscription(nodeId || '');
  
  // Trigger discovery scan if coming from node creation
  useEffect(() => {
    if (searchParams.get('triggerDiscovery') === 'true' && organizationUuid && nodeId && !loading) {
      // Remove the parameter from URL first
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('triggerDiscovery');
      setSearchParams(newParams, { replace: true });
      
      // Trigger discovery scan
      const triggerDiscoveryScan = async () => {
        try {
          await NodeApiService.startNodeScan(organizationUuid, nodeId, ['discovery']);
          console.log('Discovery scan triggered successfully for node:', nodeId);
          setScanJustStarted(true);
          setScanStartTime(Date.now());
        } catch (scanError) {
          console.error('Failed to trigger discovery scan:', scanError);
        }
      };
      
      triggerDiscoveryScan();
    }
  }, [searchParams, setSearchParams, organizationUuid, nodeId, loading]);

  // Auto-trigger discovery scan if discovery status is failed or pending
  useEffect(() => {
    if (node && organizationUuid && nodeId && !loading && !scanJustStarted) {
      const discoveryStatus = node.discovery_status?.toLowerCase();
      
      if (discoveryStatus === 'failed' || discoveryStatus === 'pending') {
        console.log(`Discovery status is ${discoveryStatus}, triggering discovery scan for node:`, nodeId);
        
        const triggerDiscoveryScan = async () => {
          try {
            await NodeApiService.startNodeScan(organizationUuid, nodeId, ['discovery']);
            console.log('Auto discovery scan triggered successfully for node:', nodeId);
            setScanJustStarted(true);
            setScanStartTime(Date.now());
          } catch (scanError) {
            console.error('Failed to trigger auto discovery scan:', scanError);
          }
        };
        
        triggerDiscoveryScan();
      }
    }
  }, [node, organizationUuid, nodeId, loading, scanJustStarted]);
  
  useEffect(() => {
    if (discoveryMessage && (discoveryMessage.type === 'scan_completed' || discoveryMessage.type === 'scan_failed')) {
      refreshScans();
      // Set scan completed flag when scan finishes
      setScanJustStarted(false);
      setScanStartTime(null);
      setScanCompleted(true);
    }
  }, [discoveryMessage, refreshScans]);

  // Clear scanJustStarted flag when we have actual scans or after sufficient time has passed
  useEffect(() => {
    if (scanJustStarted && scanStartTime) {
      const remainingScans = getRemainingScansCount(scans);
      
      if (remainingScans > 0) {
        // If we have actual remaining scans, clear the flag (real scans are now showing)
        setScanJustStarted(false);
        setScanStartTime(null);
        setScanCompleted(false); // Clear completed state when new scans appear
      } else {
        // Only clear after a significant amount of time has passed with no scans
        const timeSinceScan = Date.now() - scanStartTime;
        const minWaitTime = 45000; // 45 seconds minimum wait
        
        if (timeSinceScan > minWaitTime && !scansLoading) {
          setScanJustStarted(false);
          setScanStartTime(null);
          setScanCompleted(true); // Set completed instead of just clearing
        }
      }
    }
  }, [scans.length, scansLoading, scanJustStarted, scanStartTime]);

  // Clear completed state when new scans are detected (page refresh scenario)
  useEffect(() => {
    const remainingScans = getRemainingScansCount(scans);
    
    if (remainingScans > 0 && scanCompleted) {
      setScanCompleted(false);
    }
  }, [scans, scanCompleted]);

  // Check if we should show the discovery results modal
  useEffect(() => {
    if (node && nodeId && node.simple_state === 'active' && node.discovery_status === 'completed') {
      // Check if modal has been shown for this node
      if (!hasDiscoveryModalBeenShown(nodeId)) {
        setIsDiscoveryResultsModalOpen(true);
      }
    }
  }, [node, nodeId]);

  // Handle closing the discovery results modal
  const handleCloseDiscoveryModal = () => {
    setIsDiscoveryResultsModalOpen(false);
    if (nodeId) {
      markDiscoveryModalAsShown(nodeId);
    }
  };

  // Handle starting scan from discovery modal (with deep_discovery)
  const handleStartDiscoveryScan = () => {
    if (!organizationUuid || !nodeId) return;
    handleStartScan(['deep_discovery']);
  };

  const handleStartScan = async (scanners: string[]) => {
    if (!organizationUuid || !nodeId) return;
    
    setIsScanLoading(true);
    try {
      const response = await NodeApiService.startNodeScan(organizationUuid, nodeId, scanners);
      console.log('Scan started successfully:', response);
      
      setIsScanModalOpen(false);
      
      // Create a progress notification that will be updated
      const progressNotificationId = `scan-progress-${response.session_id}`;
      addNotification({
        id: progressNotificationId,
        type: 'scan_progress',
        title: 'Scan In Progress',
        duration: 0, // Persistent until complete
        scanSessionStatus: {
          session_id: response.session_id,
          node_uuid: response.node_uuid,
          organization_uuid: response.organization_uuid,
          status: 'running',
          total_scans: response.total_scans,
          completed_scans: 0,
          failed_scans: 0,
          scans: response.scans,
          created_at: response.created_at
        }
      });

      // Start tracking the scan progress
      scanTracker.startTracking(
        response,
        // On update callback
        (status) => {
          updateNotification(progressNotificationId, {
            scanSessionStatus: status
          });
        },
        // On complete callback
        (status) => {
          // Update final status - keep progress notification persistent until manually closed
          updateNotification(progressNotificationId, {
            scanSessionStatus: status,
            duration: 0 // Persistent until manually closed
          });
          
          // Show completion notification with longer duration
          const hasFailedScans = status.failed_scans > 0;
          addNotification({
            type: hasFailedScans ? 'warning' : 'success',
            title: hasFailedScans ? 'Scan Session Completed with Failures' : 'Scan Session Completed',
            message: `${status.completed_scans} completed, ${status.failed_scans} failed`,
            duration: 15000 // 15 seconds duration
          });
        }
      );
      
      // Immediately refresh scans to show the loader
      refreshScans();
      
      // Set flag to show loader immediately
      setScanJustStarted(true);
      setScanStartTime(Date.now());
      setScanCompleted(false); // Clear any previous completed state
      
      // Remove the setTimeout fallback as we now handle it in the useEffect
      
    } catch (error) {
      console.error('Failed to start scan:', error);
      
      // Extract error message from API response
      let errorMessage = 'Please try again or contact support if the problem persists.';
      
      if (error && typeof error === 'object' && error !== null) {
        // Check for different error response formats
        if ('response' in error && error.response && typeof error.response === 'object' && error.response !== null && 'data' in error.response) {
          const responseData = (error.response as any).data;
          if (responseData && typeof responseData === 'object') {
            // Check for detail field (common API error format)
            if ('detail' in responseData && typeof responseData.detail === 'string') {
              errorMessage = responseData.detail;
            }
            // Check for message field
            else if ('message' in responseData && typeof responseData.message === 'string') {
              errorMessage = responseData.message;
            }
            // Check for error field
            else if ('error' in responseData && typeof responseData.error === 'string') {
              errorMessage = responseData.error;
            }
          }
        }
        // Check if error has a message property directly
        else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      // Show error notification with the actual error message
      addNotification({
        type: 'error',
        title: 'Failed to Start Scan',
        message: errorMessage,
        duration: 10000 // Longer duration for error messages
      });
    } finally {
      setIsScanLoading(false);
    }
  };
  
  // Set/clear banner for unvalidated node
  useEffect(() => {
    if (node && !node.validated) {
      setBanner({
        type: 'warning',
        title: 'Unvalidated Node',
        message: 'This node has not been validated yet. Validation is required before scanning.',
        actions: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('Validate Node button clicked!');
              setIsValidationModalOpen(true);
            }}
            className="text-yellow-800 border-yellow-400 hover:bg-yellow-100 h-6 px-2"
          >
            Validate Node
          </Button>
        ),
        onClose: () => setBanner(null),
      });
    } else {
      setBanner(null);
    }
    // Only run when node changes
  }, [node, setBanner]);

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

  // Handle dispute from scan sessions
  const handleDisputeScanSession = (sessionId: string, scanTypes: string[], target: string) => {
    const scanType = scanTypes.length > 0 ? scanTypes.join(', ') : 'unknown';
    handleOpenDispute(scanType, target, sessionId);
  };

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading node data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!orgsLoading && !organization)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Server className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Node Not Found</h2>
            <p className="text-gray-500">The requested node could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check node state and render appropriate layout
  if (node.simple_state === 'active' && node.discovery_status === 'completed') {
    return (
      <>
        <NodeMainLayout
          node={node}
          organization={organization}
          nodeId={nodeId || ''}
          slug={slug || ''}
          onStartScan={() => navigate(`/organizations/${slug}/nodes/${nodeId}/scans`)}
          cveData={cveData}
          eventsData={eventsData}
          scanSessionsData={scanSessionsData}
          reportsData={reportsData}
          snapshotData={snapshotData}
          actionsData={actionsData}
          loading={loading}
          tasks={scans}
          tasksLoading={scansLoading}
          scanJustStarted={scanJustStarted}
          scanCompleted={scanCompleted}
        >

          {/* Status and Node Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <NodeStatusCard node={node} getProtocol={getProtocol} />
            <NodeInfoCard node={node} snapshotData={snapshotData} />
          </div>

          {/* Node Snapshot Section */}
          <div className="mt-8">
            <NodeSnapshotCard snapshot={snapshotData} loading={loading} />
          </div>

          {/* Node Actions Section */}
          <div className="mt-8">
            <NodeActionsCard 
              actionsData={actionsData} 
              organizationUuid={organization?.uuid} 
              nodeId={nodeId} 
            />
          </div>

          {/* CVE Details Section */}
          <div className="mt-8">
            <CVECard cves={cveData} organizationSlug={slug} nodeId={nodeId} />
          </div>

          {/* Events Section */}
          <div className="mt-8">
            <EventCard 
              events={eventsData?.events} 
              organizationSlug={slug}
              nodeId={nodeId}
            />
          </div>
          {/* Scan Sessions Section */}
          <div className="mt-8">
            <ScanSessionsCard 
              scanSessions={Array.isArray(scanSessionsData?.scans) ? scanSessionsData.scans.slice(0, 3) : []}
              slug={slug}
              nodeId={nodeId}
              viewAllHref={Array.isArray(scanSessionsData?.scans) && scanSessionsData.scans.length > 3 && slug && nodeId ? `/organizations/${slug}/nodes/${nodeId}/scans` : undefined}
              onDispute={handleDisputeScanSession}
            />
          </div>
          
          {/* 
          <div className="mt-8">
            <ReportsCard 
              reports={reportsData?.reports || []} 
              organizationSlug={slug}
              nodeId={nodeId}
            />
          </div> 
          */}
        </NodeMainLayout>
        {/* Scan Modal */}
        <ScanModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onConfirm={handleStartScan}
          isLoading={isScanLoading}
        />

        {/* Validation Modal - always available */}
        <ValidationModal
          isOpen={isValidationModalOpen}
          onClose={() => setIsValidationModalOpen(false)}
          node={node}
        />

        {/* Discovery Results Modal - shown once after discovery completion */}
        <DiscoveryResultsModal
          isOpen={isDiscoveryResultsModalOpen}
          onClose={handleCloseDiscoveryModal}
          onStartScan={handleStartDiscoveryScan}
          node={node}
        />

        {/* Dispute Modal - for handling disputes */}
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
  }
  
  // For all other states, show onboarding layout
  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Organization Not Found</h2>
            <p className="text-gray-500">The requested organization could not be found.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <NodeOnboardingLayout 
        node={node} 
        organization={organization} 
        refetchNode={refetch}
      />
      
      {/* Validation Modal - always available */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        node={node}
      />
      
      {/* Discovery Results Modal - shown once after discovery completion */}
      <DiscoveryResultsModal
        isOpen={isDiscoveryResultsModalOpen}
        onClose={handleCloseDiscoveryModal}
        onStartScan={handleStartDiscoveryScan}
        node={node}
      />

      {/* Dispute Modal - for handling disputes */}
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

export default OrgNodeDetail;
