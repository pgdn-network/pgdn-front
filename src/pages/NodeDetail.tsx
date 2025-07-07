import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Server, Activity, Shield, Settings, Play, BarChart3, Clock, MapPin, AlertTriangle, Loader2, Rocket, Search, CheckCircle, AlertCircle, X } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { CVECard } from '@/components/ui/custom/CVECard'
import { EventCard } from '@/components/ui/custom/EventCard';
import { ReportsCard } from '@/components/ui/custom/ReportsCard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import NodeBanner from '@/components/ui/custom/NodeBanner';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { scanTracker } from '@/services/scanTracker';

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

// Discovery Confirmation Page Component
const DiscoveryConfirmationPage: React.FC<{ node: any }> = ({ node }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  return (
    <>
      {/* Validation Banner - Full Width */}
      {!node.validated && showValidationBanner && (
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      )}
      
      <div className="min-h-screen bg-background">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Nodes', href: '/nodes' },
          { label: node?.name || 'Node' }
        ]} />
        
        <div className="text-center mb-8">
          <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Complete</h1>
          <p className="text-lg text-muted-foreground">
            We've successfully discovered your node {node?.name}. Please review the findings below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
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
                <Badge variant="success">Completed</Badge>
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
          </Card>

          <Card className="p-6">
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
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Discovery Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Node Registration</span>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-green-600 mr-3" />
                <span>Discovery Phase</span>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-3" />
                <span>Confirmation Required</span>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </div>
        </Card>

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
    </>
  );
};

// New Node Page Component (with discovery status)
const NewNodePage: React.FC<{ node: any }> = ({ node }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  const isDiscoveryPending = node.discovery_status === 'pending';
  const isDiscoveryFailed = node.discovery_status !== 'completed' && node.discovery_status !== 'pending';

  return (
    <>
      {/* Validation Banner - Full Width */}
      {!node.validated && showValidationBanner && (
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      )}
      
      <div className="min-h-screen bg-background">
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Nodes', href: '/nodes' },
          { label: node?.name || 'Node' }
        ]} />
        
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Node Onboarding</h1>
          <p className="text-lg text-muted-foreground">
            Let's get your node {node?.name} set up and ready for scanning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
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
                <Badge variant="secondary">{node?.simple_state}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <Search className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">Discovery Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant={isDiscoveryPending ? 'secondary' : isDiscoveryFailed ? 'warning' : 'success'}
                >
                  {node?.discovery_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Validated:</span>
                <Badge variant={node?.validated ? 'success' : 'warning'}>
                  {node?.validated ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ready for Scan:</span>
                <Badge variant={node?.is_ready_for_scan ? 'success' : 'secondary'}>
                  {node?.is_ready_for_scan ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Discovery Status Specific Content */}
        {isDiscoveryPending && (
          <Card className="p-6 mb-6">
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
          </Card>
        )}

        {isDiscoveryFailed && (
          <Card className="p-6 mb-6">
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
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Onboarding Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Node Registration</span>
              </div>
              <Badge variant="success">Completed</Badge>
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
              <Badge variant={
                isDiscoveryPending ? 'secondary' : isDiscoveryFailed ? 'warning' : 'success'
              }>
                {isDiscoveryPending ? 'In Progress' : isDiscoveryFailed ? 'Failed' : 'Completed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <span>Security Assessment</span>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [showValidationBanner, setShowValidationBanner] = useState(true);
  const { addNotification, updateNotification } = useNotifications();
  
  const organizationUuid = organizations.length > 0 ? organizations[0].uuid : '';
  const { 
    node, 
    cveData, 
    eventsData, 
    interventionsData, 
    scanSessionsData, 
    reportsData,
    loading, 
    error, 
    refetch 
  } = useNodeData(organizationUuid, id || '');

  const handleStartScan = async (scanners: string[]) => {
    if (!organizationUuid || !id) return;
    
    setIsScanLoading(true);
    try {
      const response = await NodeApiService.startNodeScan(organizationUuid, id, scanners);
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
  
  
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Nodes', href: '/nodes' },
    { label: node?.name || id || 'Node' }
  ];

  // Helper for full-width banner
  const renderBanner = () => (
    !node?.validated && showValidationBanner && (
      <div className="w-full"> {/* Ensure full width */}
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      </div>
    )
  );

  if (loading || orgsLoading) {
    return (
      <>
        {renderBanner()}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading node data...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || (!orgsLoading && organizations.length === 0)) {
    return (
      <>
        {renderBanner()}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && organizations.length === 0 ? 'No organizations available' : 'Unknown error')}
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!node) {
    return (
      <>
        {renderBanner()}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <Server className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Node Not Found</h2>
            <p className="text-gray-500">The requested node could not be found.</p>
          </div>
        </div>
      </>
    );
  }

  // Check node state and render appropriate page
  if (node.simple_state === 'new' && node.discovery_status === 'completed') {
    return (
      <>
        {renderBanner()}
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <DiscoveryConfirmationPage node={node} />
        </div>
      </>
    );
  }
  
  if (node.simple_state === 'new' && node.discovery_status !== 'completed') {
    return (
      <>
        {renderBanner()}
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <NewNodePage node={node} />
        </div>
      </>
    );
  }

  // Default: Show normal node details page
  return (
    <>
      {renderBanner()}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-4">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Server className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{node.name}</h1>
                  <p className="mt-1 text-sm text-gray-500-foreground">
                    {node.address} • {node.protocol_details.display_name}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <Button 
                variant="default" 
                onClick={() => setIsScanModalOpen(true)}
                disabled={!node.is_ready_for_scan}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Status Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Node Status</h2>
              <Activity className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Status:</span>
                <Badge variant={node.status === 'active' ? 'success' : 'secondary'}>
                  {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">State:</span>
                <Badge variant="secondary">{node.simple_state}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Validated:</span>
                <Badge variant={node.validated ? 'success' : 'warning'}>
                  {node.validated ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Ready for Scan:</span>
                <Badge variant={node.is_ready_for_scan ? 'success' : 'secondary'}>
                  {node.is_ready_for_scan ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Protocol:</span>
                <span className="text-sm text-foreground">{node.protocol_details.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Created:</span>
                <span className="text-sm text-foreground">{new Date(node.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Location Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Location</h2>
              <MapPin className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Address:</span>
                <span className="text-sm text-foreground">{node.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Resolved IPs:</span>
                <span className="text-sm text-foreground">{node.resolved_ips.length}</span>
              </div>
              {node.resolved_ips.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500-foreground">Primary IP:</span>
                  <span className="text-sm text-foreground">{node.resolved_ips[0].ip_address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Ports:</span>
                <span className="text-sm text-foreground">{node.protocol_details.ports.join(', ')}</span>
              </div>
            </div>
          </Card>

          {/* Performance Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Performance</h2>
              <BarChart3 className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Total Scans:</span>
                <span className="text-sm text-foreground">{node.total_scan_sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Total Reports:</span>
                <span className="text-sm text-foreground">{node.total_reports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Last Scan:</span>
                <span className="text-sm text-foreground">{node.last_scan_session ? 'Available' : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Endpoints:</span>
                <span className="text-sm text-foreground">{node.protocol_details.endpoints.length}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Clock className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Node created</p>
                  <p className="text-xs text-gray-500-foreground">{new Date(node.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Last updated</p>
                  <p className="text-xs text-gray-500-foreground">{new Date(node.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {node.meta.notes && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">Notes</p>
                    <p className="text-xs text-gray-500-foreground">{node.meta.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Security Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Security Status</h2>
              <Shield className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Total CVEs:</span>
                <Badge variant={node.cve_summary.total_cves > 0 ? 'warning' : 'success'}>
                  {node.cve_summary.total_cves}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Critical:</span>
                <Badge variant={node.cve_summary.critical_count > 0 ? 'warning' : 'secondary'}>
                  {node.cve_summary.critical_count}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">High:</span>
                <Badge variant={node.cve_summary.high_count > 0 ? 'warning' : 'secondary'}>
                  {node.cve_summary.high_count}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Medium + Low:</span>
                <Badge variant={node.cve_summary.medium_count + node.cve_summary.low_count > 0 ? 'secondary' : 'success'}>
                  {node.cve_summary.medium_count + node.cve_summary.low_count}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
        
        {/* CVE Details Section */}
        <div className="mt-6">
                        <CVECard cves={cveData} organizationSlug={organizations.find(org => org.uuid === organizationUuid)?.slug} nodeId={id} />
        </div>

        {/* Events Section */}
        <div className="mt-6">
                        <EventCard events={eventsData?.events} />
        </div>

        {/* Interventions Section */}
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Interventions</h2>
              <span className="text-sm text-muted-foreground">
                {interventionsData?.interventions?.length || 0} interventions
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {interventionsData ? 'Interventions data loaded' : 'Loading interventions...'}
            </div>
          </Card>
        </div>

        {/* Tasks Section */}
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
              <span className="text-sm text-muted-foreground">
                0 tasks
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Tasks functionality coming soon...
            </div>
          </Card>
        </div>

        {/* Scan Sessions Section */}
        <div className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Scan Sessions</h2>
              <span className="text-sm text-muted-foreground">
                {scanSessionsData?.scans?.length || 0} sessions
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {scanSessionsData ? 'Scan sessions data loaded' : 'Loading scan sessions...'}
            </div>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="mt-6">
                        <ReportsCard reports={reportsData?.reports} />
        </div>
      </div>
      
      {/* Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onConfirm={handleStartScan}
        isLoading={isScanLoading}
      />
    </>
  );
};

export default NodeDetail;
