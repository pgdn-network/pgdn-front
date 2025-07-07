import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Server, AlertTriangle, Loader2, AlertCircle, X, Rocket, Search, CheckCircle, Activity, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CVECard } from '@/components/ui/custom/CVECard';
import { EventCard } from '@/components/ui/custom/EventCard';
import { ReportsCard } from '@/components/ui/custom/ReportsCard';
import { ScanSessionsCard } from '@/components/ui/custom/ScanSessionsCard';
import { NodeSnapshotCard } from '@/components/ui/custom/NodeSnapshotCard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import NodeBanner from '@/components/ui/custom/NodeBanner';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { scanTracker } from '@/services/scanTracker';

// New Node Page Component (with discovery status)
const NewNodePage: React.FC<{ node: any; organization: any }> = ({ node, organization }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  const isDiscoveryPending = node.discovery_status === 'pending';
  const isDiscoveryFailed = node.discovery_status !== 'completed' && node.discovery_status !== 'pending';

  return (
    <div className="min-h-screen bg-background">
      {/* Validation Banner - Full Width */}
      {!node.validated && showValidationBanner && (
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      )}
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Node Onboarding</h2>
            <p className="text-lg text-muted-foreground">
              Let's get your node {node?.name} set up and ready for scanning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Node Created</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your node has been successfully created and is ready for the onboarding process.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{node?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-medium">{node?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-medium">{node?.protocol_details?.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="font-medium">{node?.simple_state}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Search className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isDiscoveryPending ? 'bg-blue-100 text-blue-800' : 
                    isDiscoveryFailed ? 'bg-red-100 text-red-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {node?.discovery_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Validated:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    node?.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {node?.validated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ready for Scan:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    node?.is_ready_for_scan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {node?.is_ready_for_scan ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery Status Specific Content */}
          {isDiscoveryPending && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery in Progress</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                We're currently discovering and analyzing your node. This process may take a few minutes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Network connectivity established</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm">Port scanning in progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Service identification</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Vulnerability assessment</span>
                </div>
              </div>
            </div>
          )}

          {isDiscoveryFailed && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery Failed</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                The discovery process encountered an error. Please check your node configuration and try again.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-red-600">Discovery process failed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Check network connectivity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Verify protocol configuration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Review firewall settings</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="mr-3">
                  Retry Discovery
                </Button>
                <Button variant="outline">
                  View Logs
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Onboarding Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Node Registration</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDiscoveryPending ? 'bg-blue-50' : isDiscoveryFailed ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center">
                  <Search className={`h-5 w-5 mr-3 ${
                    isDiscoveryPending ? 'text-blue-600' : isDiscoveryFailed ? 'text-red-600' : 'text-green-600'
                  }`} />
                  <span>Discovery Phase</span>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  isDiscoveryPending ? 'bg-blue-100 text-blue-800' : 
                  isDiscoveryFailed ? 'bg-red-100 text-red-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {isDiscoveryPending ? 'In Progress' : isDiscoveryFailed ? 'Failed' : 'Completed'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <span>Security Assessment</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Discovery Confirmation Page Component
const DiscoveryConfirmationPage: React.FC<{ node: any; organization: any }> = ({ node, organization }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Validation Banner - Full Width */}
      {!node.validated && showValidationBanner && (
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      )}
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Complete</h1>
            <p className="text-lg text-muted-foreground">
              We've successfully discovered your node {node?.name} in {organization?.name}. Please review the findings below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery Results</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                The discovery process has completed successfully. Here's what we found:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Endpoints Found:</span>
                  <span className="font-medium">{node?.protocol_details?.endpoints?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ports Scanned:</span>
                  <span className="font-medium">{node?.protocol_details?.ports?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-medium">{node?.protocol_details?.display_name}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Next Steps</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Discovery completed successfully</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm">Review discovery results</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm">Confirm or modify findings</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Proceed to security scanning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Discovery Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Node Registration</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-green-600 mr-3" />
                  <span>Discovery Phase</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-yellow-600 mr-3" />
                  <span>Confirmation Required</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Modify Discovery
            </Button>
            <Button size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Discovery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Validation Banner Component
const ValidationBanner: React.FC<{ node: any; onClose: () => void }> = ({ node, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateAction = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setIsModalOpen(true)}
      className="text-yellow-800 border-yellow-400 hover:bg-yellow-100 h-6 px-2"
    >
      Validate Node
    </Button>
  );

  return (
    <>
      <NodeBanner
        type="warning"
        title="Unvalidated Node"
        message="This node has not been validated yet. Validation is required before scanning."
        onClose={onClose}
        actions={validateAction}
      />

      {/* Validation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Validate Node</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Node validation ensures that the target is reachable and properly configured for scanning.
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Validation Process:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Network connectivity test</li>
                  <li>• Protocol verification</li>
                  <li>• Port accessibility check</li>
                  <li>• Security policy compliance</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement validation logic
                    console.log('Validating node:', node.uuid);
                    setIsModalOpen(false);
                  }}
                >
                  Start Validation
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OrgNodeDetail: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [showValidationBanner, setShowValidationBanner] = useState(true);
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

  // Check node state and render appropriate page
  if (node.simple_state === 'new' && node.discovery_status === 'completed') {
    return <DiscoveryConfirmationPage node={node} organization={organization} />;
  }
  
  if (node.simple_state === 'new' && node.discovery_status !== 'completed') {
    return <NewNodePage node={node} organization={organization} />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{organization?.name} - Node: {node.name}</h1>
                          <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                Detailed information and metrics for this node in {organization?.name}
              </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button 
              onClick={() => setIsScanModalOpen(true)}
              disabled={!node.is_ready_for_scan}
            >
              Start Scan
            </Button>
            <Button variant="outline">
              Settings
            </Button>
          </div>
        </div>
        
        {/* Validation Banner */}
        {!node.validated && showValidationBanner && (
          <ValidationBanner 
            node={node} 
            onClose={() => setShowValidationBanner(false)} 
          />
        )}
        
        {/* Node Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Node Status Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {node.status ? node.status.charAt(0).toUpperCase() + node.status.slice(1) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">State:</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {node.simple_state || 'Unknown'}
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
                  node.is_ready_for_scan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {node.is_ready_for_scan ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-sm text-gray-900 dark:text-white">{node.protocol_details?.display_name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Seen:</span>
                <span className="text-sm text-gray-900 dark:text-white">{new Date(node.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Node Metrics Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">CPU Usage:</span>
                <span className="text-sm text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Memory:</span>
                <span className="text-sm text-gray-900 dark:text-white">2.1GB / 4GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Storage:</span>
                <span className="text-sm text-gray-900 dark:text-white">120GB / 500GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Network:</span>
                <span className="text-sm text-gray-900 dark:text-white">1.2 Mbps</span>
              </div>
            </div>
          </div>
          
          {/* Node Info Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Node ID:</span>
                <span className="text-sm text-gray-900 dark:text-white">{nodeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">IP Address:</span>
                <span className="text-sm text-gray-900 dark:text-white">{node.resolved_ips.length > 0 ? node.resolved_ips[0].ip_address : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Port:</span>
                <span className="text-sm text-gray-900 dark:text-white">{node.protocol_details?.ports?.length > 0 ? node.protocol_details.ports[0] : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                <span className="text-sm text-gray-900 dark:text-white">{node.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Version:</span>
                <span className="text-sm text-gray-900 dark:text-white">v1.2.3</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-900 dark:text-white">Node created successfully</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.created_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-900 dark:text-white">Health check passed</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-sm text-gray-900 dark:text-white">Storage usage normal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-sm text-gray-900 dark:text-white">Assigned to organization: {organization?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(node.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Organization Context */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Organization Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Details</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name: {organization?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Slug: {slug}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Nodes: {node.total_scan_sessions || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Role</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role: {node.protocol_details?.display_name || 'Unknown'} Node</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned: {new Date(node.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority: {node.status === 'active' ? 'High' : 'Normal'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Interventions</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Open: {interventionsData?.open_count || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  In Progress: {interventionsData?.in_progress_count || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Resolved: {interventionsData?.resolved_count || 0}
                </span>
              </div>
            </div>
            
            {interventionsData?.interventions && interventionsData.interventions.length > 0 ? (
              <div className="space-y-4">
                {interventionsData.interventions.map((intervention) => (
                  <div key={intervention.uuid} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{intervention.reason}</p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Type: {intervention.related_type}</span>
                          <span>Created: {new Date(intervention.created_at).toLocaleDateString()}</span>
                          {intervention.resolved_at && (
                            <span>Resolved: {new Date(intervention.resolved_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        intervention.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {intervention.status.replace('_', ' ').charAt(0).toUpperCase() + 
                         intervention.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {interventionsData ? 'No interventions found' : 'Loading interventions...'}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section - Hidden for now */}
        {/* <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tasksData?.tasks?.length || 0} tasks
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {tasksData ? 'Tasks data loaded' : 'Loading tasks...'}
            </div>
          </div>
        </div> */}

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
        
        {/* TODO: Add organization-specific node configuration */}
        {/* TODO: Add node transfer between organizations */}
        {/* TODO: Add organization-specific alerts */}
        {/* TODO: Add node role management within organization */}
      </div>
      
      {/* Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onConfirm={handleStartScan}
        isLoading={isScanLoading}
      />
    </div>
  );
};

export default OrgNodeDetail;
