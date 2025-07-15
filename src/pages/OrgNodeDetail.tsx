import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Server, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/ui/custom/EventCard';
import { NodeSnapshotCard } from '@/components/ui/custom/NodeSnapshotCard';
import { NodeActionsCard } from '@/components/ui/custom/NodeActionsCard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import { ValidationModal } from '@/components/ui/custom/ValidationModal';
import { DiscoveryResultsModal } from '@/components/ui/custom/DiscoveryResultsModal';
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
import { useNodeTasksPolling } from '@/hooks/useNodeTasksPolling';


import { NodeStatusCard } from '@/components/ui/custom/NodeStatusCard';
import { NodeInfoCard } from '@/components/ui/custom/NodeInfoCard';

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDiscoveryResultsModalOpen, setIsDiscoveryResultsModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
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

  // Poll for node tasks every 15 seconds
  const { tasks, total, refresh: refreshTasks } = useNodeTasksPolling(organizationUuid, nodeId || '');

  // Listen for WebSocket messages and refresh tasks when scan completes
  const discoveryMessage = useNodeDiscoverySubscription(nodeId || '');
  
  useEffect(() => {
    if (discoveryMessage && (discoveryMessage.type === 'scan_completed' || discoveryMessage.type === 'scan_failed')) {
      console.log('WebSocket scan message received, refreshing tasks:', discoveryMessage.type);
      refreshTasks();
    }
  }, [discoveryMessage, refreshTasks]);

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
      
      // Show initial success notification
      addNotification({
        type: 'success',
        title: 'Scan Started Successfully',
        message: `Started ${scanners.length} scanner${scanners.length > 1 ? 's' : ''}: ${scanners.join(', ')}`,
        duration: 8000 // 8 seconds duration
      });

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
      
      // Immediately refresh tasks to show the loader
      refreshTasks();
      
    } catch (error) {
      console.error('Failed to start scan:', error);
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Failed to Start Scan',
        message: 'Please try again or contact support if the problem persists.',
        duration: 7000
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
          onStartScan={() => setIsScanModalOpen(true)}
          cveData={null}
          eventsData={eventsData}
          scanSessionsData={scanSessionsData}
          reportsData={reportsData}
          snapshotData={snapshotData}
          actionsData={actionsData}
          loading={loading}
          tasks={tasks}
          totalTasks={total}
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

          {/* CVE Details Section 
          <div className="mt-8">
            <CVECard cves={cveData} organizationSlug={slug} nodeId={nodeId} />
          </div>
          */}
          {/* Events Section */}
          <div className="mt-8">
            <EventCard 
              events={eventsData?.events} 
              organizationSlug={slug}
              nodeId={nodeId}
            />
          </div>
          {/* Scan Sessions Section 
          <div className="mt-8">
            <ScanSessionsCard 
              scanSessions={Array.isArray(scanSessionsData?.scans) ? scanSessionsData.scans.slice(0, 3) : []}
              slug={slug}
              nodeId={nodeId}
              viewAllHref={Array.isArray(scanSessionsData?.scans) && scanSessionsData.scans.length > 3 && slug && nodeId ? `/organizations/${slug}/nodes/${nodeId}/scans` : undefined}
            />
          </div>
          
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
      <NodeOnboardingLayout node={node} organization={organization} />
      
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
    </>
  );
};

export default OrgNodeDetail;
