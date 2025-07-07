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
import { useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { scanTracker } from '@/services/scanTracker';
import { useBanner } from '@/contexts/BannerContext';

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const { banner, setBanner } = useBanner();
  const { addNotification, updateNotification } = useNotifications();
  
  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';
  const { 
    node, 
    cveData, 
    eventsData, 
    interventionsData, 
    // tasksData, // Commented out for now
    scanSessionsData, 
    reportsData,
    statusData,
    snapshotData,
    loading, 
    error, 
    refetch 
  } = useNodeData(organizationUuid, nodeId || '');

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
        />
        
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
