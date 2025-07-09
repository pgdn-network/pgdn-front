import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Server, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CVECard } from '@/components/ui/custom/CVECard';
import { EventCard } from '@/components/ui/custom/EventCard';
import { ReportsCard } from '@/components/ui/custom/ReportsCard';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';
import { NodeSnapshotCard } from '@/components/ui/custom/NodeSnapshotCard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import { ValidationModal } from '@/components/ui/custom/ValidationModal';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { NodeOnboardingLayout } from '@/components/ui/custom/NodeOnboardingLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { useBasicNodeData, useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { scanTracker } from '@/services/scanTracker';
import { useBanner } from '@/contexts/BannerContext';
import { NodeInterventions } from '@/components/ui/custom/NodeInterventions';
import { NodeActivity } from '@/components/ui/custom/NodeActivity';
import { useProtocols } from '@/contexts/ProtocolsContext';

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const { banner, setBanner } = useBanner();
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

  // Only use full node data if node is active and discovery is completed
  const shouldUseFullData = basicNode?.simple_state === 'active' && basicNode?.discovery_status === 'completed';
  
  const { 
    node: fullNode, 
    cveData, 
    eventsData, 
    interventionsData, 
    // tasksData, // Commented out for now
    scanSessionsData, 
    reportsData,
    statusData,
    snapshotData,
    loading: fullLoading, 
    error: fullError, 
    refetch: fullRefetch 
  } = useNodeData(shouldUseFullData ? organizationUuid : '', shouldUseFullData ? nodeId || '' : '');

  // Use the appropriate node data based on state
  const node = shouldUseFullData ? fullNode : basicNode;
  const loading = basicLoading || (shouldUseFullData && fullLoading);
  const error = basicError || fullError;
  const refetch = shouldUseFullData ? fullRefetch : basicRefetch;

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
          cveData={cveData}
          eventsData={eventsData}
          interventionsData={interventionsData}
          scanSessionsData={scanSessionsData}
          reportsData={reportsData}
          snapshotData={snapshotData}
          loading={loading}
        >
          {/* Status and Node Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Node Status Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {node.simple_state ? node.simple_state.charAt(0).toUpperCase() + node.simple_state.slice(1) : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Validated:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    node.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {node.validated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ready for Scan:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (node.simple_state === 'active' && node.discovery_status === 'completed') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(node.simple_state === 'active' && node.discovery_status === 'completed') ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {Array.isArray(node.node_protocols) && node.node_protocols.length > 0
                      ? node.node_protocols.map((uuid: string) => {
                          const proto = getProtocol(uuid);
                          return proto ? proto.display_name : 'Unknown';
                        }).join(', ')
                      : node.protocol_details?.display_name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            {/* Node Info Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">IP Address(es):</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {node.resolved_ips.length === 0 && 'N/A'}
                    {node.resolved_ips.length > 0 && (
                      <>
                        {node.resolved_ips.slice(0, 3).map((ip: any, idx: number) => (
                          <span key={ip.ip_address}>
                            {ip.ip_address}{idx < Math.min(2, node.resolved_ips.length - 1) ? ', ' : ''}
                          </span>
                        ))}
                        {node.resolved_ips.length > 3 && (
                          <span className="ml-1 text-xs text-blue-600 underline cursor-pointer">+{node.resolved_ips.length - 3} more</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Geo Location:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{snapshotData?.geo_location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Hostname:</span>
                  <span className="text-sm text-gray-900 dark:text-white">{node.address}</span>
                </div>
                {/* TODO: Harcoded version for now, add version from node */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Version:</span>
                  <span className="text-sm text-gray-900 dark:text-white">v1.2.3</span>
                </div>
              </div>
            </div>
          </div>
          {/* Node Snapshot Section */}
          <div className="mt-8">
            <NodeSnapshotCard snapshot={snapshotData} loading={loading} />
          </div>
          {/* Interventions Section */}
          <NodeInterventions interventionsData={interventionsData} />
          {/* CVE Details Section */}
          <div className="mt-8">
            <CVECard cves={cveData} organizationSlug={slug} nodeId={nodeId} />
          </div>
          <NodeActivity node={node} organization={organization} />
          {/* Events Section */}
          <div className="mt-8">
            <EventCard events={eventsData?.events} />
          </div>
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
    </>
  );
};

export default OrgNodeDetail;
