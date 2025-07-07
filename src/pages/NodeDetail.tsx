import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Server, Activity, Shield, Settings, Play, BarChart3, Clock, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { CVECard } from '@/components/ui/custom/CVECard'
import { EventCard } from '@/components/ui/custom/EventCard';
import { ReportsCard } from '@/components/ui/custom/ReportsCard';
import { ScanModal } from '@/components/ui/custom/ScanModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNodeData } from '@/hooks/useNodeData';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { scanTracker } from '@/services/scanTracker';

const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const { addNotification, updateNotification } = useNotifications();
  
  const organizationUuid = organizations.length > 0 ? organizations[0].uuid : '';
  const { 
    node, 
    cveData, 
    eventsData, 
    interventionsData, 
    tasksData, 
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

  if (error || (!orgsLoading && organizations.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background">
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
              <Button variant="default" onClick={() => setIsScanModalOpen(true)}>
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
                <span className="text-sm text-foreground">{node.current_state}</span>
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
                {tasksData?.tasks?.length || 0} tasks
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tasksData ? 'Tasks data loaded' : 'Loading tasks...'}
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
    </div>
  );
};

export default NodeDetail;
