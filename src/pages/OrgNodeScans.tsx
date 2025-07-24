import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NodeApiService } from '@/api/nodes';
import { useNodeDiscoverySubscription } from '@/hooks/useWebSocketSubscription';
import { scanTracker } from '@/services/scanTracker';
import { useNodeScansPolling } from '@/hooks/useNodeScansPolling';
import { getAvailableScanners } from '@/config/scanTypes';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { NodeScanTaskLoader } from '@/components/ui/custom/NodeScanTaskLoader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { NodeScanSession, Node, NodeScanSessionsResponse } from '@/types/node';


const OrgNodeScans: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { addNotification, updateNotification } = useNotifications();
  const [customScanOpen, setCustomScanOpen] = useState(false);
  const [protocolScanOpen, setProtocolScanOpen] = useState(false);
  const [portScanOpen, setPortScanOpen] = useState(false);
  const [smartScanModalOpen, setSmartScanModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [ports, setPorts] = useState('');
  
  // Targeted state for only what we need
  const [node, setNode] = useState<Node | null>(null);
  const [scanSessionsData, setScanSessionsData] = useState<NodeScanSessionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scan tracking state
  const [scanJustStarted, setScanJustStarted] = useState(false);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);

  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  // Poll for running scan sessions every 15 seconds
  const { scans, loading: scansLoading, refresh: refreshScans } = useNodeScansPolling(organizationUuid, nodeId || '');

  // Helper function to count running scans
  const getRemainingScansCount = (scans: any[]) => {
    return scans.length; // All scans returned are running scans
  };

  // Listen for WebSocket messages
  const discoveryMessage = useNodeDiscoverySubscription(nodeId || '');

  // Function to fetch scan page data
  const fetchScanPageData = async () => {
    if (!organizationUuid || !nodeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load node info and scan sessions in parallel
      const [nodeData, scanData] = await Promise.all([
        NodeApiService.getNode(organizationUuid, nodeId),
        NodeApiService.getNodeScanSessions(organizationUuid, nodeId, 100, 0)
      ]);

      setNode(nodeData);
      setScanSessionsData(scanData);
    } catch (err) {
      console.error('Error loading scan page data:', err);
      setError('Failed to load scan data');
    } finally {
      setLoading(false);
    }
  };

  // Load only the data we need for the scan page
  useEffect(() => {
    fetchScanPageData();
  }, [organization?.uuid, nodeId]);

  // Listen for WebSocket messages and refresh tasks when scan completes
  useEffect(() => {
    if (discoveryMessage && (discoveryMessage.type === 'scan_completed' || discoveryMessage.type === 'scan_failed')) {
      refreshScans();
      fetchScanPageData();
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
        // We have actual running scans, clear the flag
        setScanJustStarted(false);
        setScanStartTime(null);
      } else {
        // Check if enough time has passed (30 seconds)
        const timeElapsed = Date.now() - scanStartTime;
        if (timeElapsed > 30000) {
          setScanJustStarted(false);
          setScanStartTime(null);
        }
      }
    }
  }, [scans.length, scansLoading, scanJustStarted, scanStartTime]);

  // Clear completed state when new scans are detected
  useEffect(() => {
    const remainingScans = getRemainingScansCount(scans);
    
    if (remainingScans > 0 && scanCompleted) {
      setScanCompleted(false);
    }
  }, [scans, scanCompleted]);

  // Get real scan sessions data from API
  const scanSessions = scanSessionsData?.scans || [];
  const sortedSessions = [...scanSessions].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ); // Show all scan jobs (up to 100)

  // Utility functions
  const formatScanType = (session: NodeScanSession): string => {
    // Use scan_types if available (preferred)
    if (session.scan_types && session.scan_types.length > 0) {
      // Format scan types to be more readable
      const formattedTypes = session.scan_types.map(type => 
        type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      return formattedTypes.join(' + ');
    }
    
    // Fallback to protocol filter
    if (session.protocol_filter) {
      return `${session.protocol_filter} Scan`;
    }
    
    // Fallback to scan level
    if (session.scan_level) {
      return `Level ${session.scan_level} Scan`;
    }
    
    return 'Basic Scan';
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (started: string, completed: string | null): string => {
    if (!completed) return 'In progress';
    const startTime = new Date(started).getTime();
    const endTime = new Date(completed).getTime();
    const durationMs = endTime - startTime;
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.round((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };


  // Get available scan types from config
  const availableScanners = getAvailableScanners();

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

  const handleStartScan = async (scanners: string[], ports?: number[]) => {
    if (!organizationUuid || !nodeId) return;
    
    try {
      const response = await NodeApiService.startNodeScan(organizationUuid, nodeId, scanners, ports);
      console.log('Scan started successfully:', response);
      
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
        async (status) => {
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
          
          // Refresh scan sessions data to update the "Recent Scan Jobs" card with completion status
          try {
            const updatedScanData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeId, 100, 0);
            setScanSessionsData(updatedScanData);
          } catch (err) {
            console.error('Failed to refresh scan sessions on completion:', err);
          }
        }
      );
      
      // Immediately refresh scans to show the loader
      refreshScans();
      
      // Refresh scan sessions data to update the "Recent Scan Jobs" card
      try {
        const updatedScanData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeId, 100, 0);
        setScanSessionsData(updatedScanData);
      } catch (err) {
        console.error('Failed to refresh scan sessions:', err);
      }
      
      // Set flag to show loader immediately
      setScanJustStarted(true);
      setScanStartTime(Date.now());
      setScanCompleted(false); // Clear any previous completed state
      
    } catch (error) {
      console.error('Failed to start scan:', error);
      
      // Extract error message from API response
      let errorMessage = 'Please try again or contact support if the problem persists.';
      
      if (error && typeof error === 'object' && error !== null) {
        // Check for different error response formats
        if ('response' in error && error.response && typeof error.response === 'object' && error.response !== null && 'data' in error.response) {
          const errorData = error.response.data;
          if (errorData && typeof errorData === 'object' && 'message' in errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (errorData && typeof errorData === 'object' && 'error' in errorData && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Failed to Start Scan',
        message: errorMessage,
        duration: 8000
      });
    }
  };

  const handleCustomScanStart = async () => {
    if (selectedOptions.length === 0) {
      addNotification({
        type: 'error',
        title: 'No Scanners Selected',
        message: 'Please select at least one scanner.',
        duration: 3000
      });
      return;
    }

    setCustomScanOpen(false);
    setSelectedOptions([]);
    await handleStartScan(selectedOptions);
  };


  const handleProtocolScanStart = async () => {
    // For Intelligent Sui Analysis, use advanced scanner
    const protocolScanners = ['advanced'];
    setProtocolScanOpen(false);
    await handleStartScan(protocolScanners);
  };

  const handlePortScanStart = async () => {
    // Validate ports input
    if (!ports.trim()) {
      addNotification({
        type: 'error',
        title: 'No Ports Specified',
        message: 'Please enter at least one port.',
        duration: 3000
      });
      return;
    }

    // Parse comma-separated ports
    const portList = ports.split(',').map(p => p.trim()).filter(p => p);
    
    if (portList.length === 0) {
      addNotification({
        type: 'error',
        title: 'No Valid Ports',
        message: 'Please enter valid port numbers.',
        duration: 3000
      });
      return;
    }

    if (portList.length > 5) {
      addNotification({
        type: 'error',
        title: 'Too Many Ports',
        message: 'Maximum 5 ports allowed.',
        duration: 3000
      });
      return;
    }

    // Validate each port
    for (const portStr of portList) {
      const port = parseInt(portStr);
      if (isNaN(port) || port < 1 || port > 65535) {
        addNotification({
          type: 'error',
          title: 'Invalid Port',
          message: `Port "${portStr}" is invalid. Ports must be numbers between 1 and 65535.`,
          duration: 3000
        });
        return;
      }
    }

    // Convert port strings to numbers
    const portNumbers = portList.map(p => parseInt(p));
    
    // Use port_scan scanner type for port-specific scanning
    const portScanners = ['port_scan'];
    setPortScanOpen(false);
    setPorts('');
    
    // Start port scan with specific ports
    await handleStartScan(portScanners, portNumbers);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'complete': return '•';
      case 'running':
      case 'in_progress': return '•';
      case 'failed':
      case 'error': return '•';
      default: return '•';
    }
  };



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
      snapshotData={null}
      actionsData={null}
      loading={loading}
      tasks={scans}
      tasksLoading={scansLoading}
      scanJustStarted={scanJustStarted}
      scanCompleted={scanCompleted}
      hideScanButton={true}
    >
      <div className="space-y-6">
        {/* Scan Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => {
                    setSmartScanModalOpen(true);
                    setCustomScanOpen(false);
                    setProtocolScanOpen(false);
                    setPortScanOpen(false);
                  }}
                  className="min-w-24"
                >
                  Smart Scan
                </Button>
                <Button 
                  onClick={() => {
                    setCustomScanOpen(!customScanOpen);
                    setProtocolScanOpen(false);
                    setPortScanOpen(false);
                  }}
                  variant="outline"
                  className="min-w-24"
                >
                  Custom Scan
                </Button>
                <Button 
                  onClick={() => {
                    setProtocolScanOpen(!protocolScanOpen);
                    setCustomScanOpen(false);
                    setPortScanOpen(false);
                  }}
                  variant="secondary"
                  className="min-w-24"
                >
                  Protocol Specific
                </Button>
                {node?.validated && (
                  <Button 
                    onClick={() => {
                      setPortScanOpen(!portScanOpen);
                      setCustomScanOpen(false);
                      setProtocolScanOpen(false);
                    }}
                    variant="secondary"
                    className="min-w-24"
                  >
                    Port Scan
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="min-w-24"
                >
                  <Link to="/orchestrations" className="no-underline">
                    Orchestration
                  </Link>
                </Button>
              </div>
              <NodeScanTaskLoader 
                remaining={getRemainingScansCount(scans)}
                loading={scansLoading}
                scanJustStarted={scanJustStarted}
                scanCompleted={scanCompleted}
              />
            </div>

            {/* Orchestration Status */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <input
                type="checkbox"
                checked={node?.orchestration_enabled ?? true}
                disabled
                className="rounded border-border"
              />
              <span className="text-sm text-muted">
                Orchestration {(node?.orchestration_enabled ?? true) ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {/* Custom Scan Configuration */}
            {customScanOpen && (
              <div className="mt-4 p-4 border rounded-lg bg-surface-secondary">
                <h4 className="font-medium mb-3">Select Scanners</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {availableScanners.map((scanner) => (
                    <label key={scanner.id} className="flex items-start space-x-3 p-2 rounded hover:bg-surface-hover cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(scanner.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOptions([...selectedOptions, scanner.id]);
                          } else {
                            setSelectedOptions(selectedOptions.filter(o => o !== scanner.id));
                          }
                        }}
                        className="rounded border-border mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{scanner.label}</div>
                        <div className="text-xs text-muted mt-1">{scanner.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCustomScanStart} size="sm">
                    Start Custom Scan
                  </Button>
                  <Button 
                    onClick={() => {
                      setCustomScanOpen(false);
                      setSelectedOptions([]);
                    }} 
                    variant="ghost" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Protocol Specific Scans Configuration */}
            {protocolScanOpen && (
              <div className="mt-4 p-4 border rounded-lg bg-surface-secondary">
                <h4 className="font-medium mb-3">Protocol Specific Scans</h4>
                <div className="space-y-2 mb-4">
                  <Button 
                    onClick={() => {
                      handleProtocolScanStart();
                      setProtocolScanOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Intelligent Sui Analysis
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setProtocolScanOpen(false)} 
                    variant="ghost" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Port Scan Configuration */}
            {portScanOpen && (
              <div className="mt-4 p-4 border rounded-lg bg-surface-secondary">
                <h4 className="font-medium mb-3">Port Scan Configuration</h4>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ports</label>
                    <input
                      type="text"
                      value={ports}
                      onChange={(e) => setPorts(e.target.value)}
                      placeholder="22,80,443"
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="text-xs text-muted">
                    Enter up to 5 ports separated by commas (e.g., 22,80,443). Each port must be between 1 and 65535.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePortScanStart} size="sm">
                    Start Port Scan
                  </Button>
                  <Button 
                    onClick={() => {
                      setPortScanOpen(false);
                      setPorts('');
                    }} 
                    variant="ghost" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Queue / Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSessions.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p>No scan sessions found</p>
                <p className="text-sm mt-1">Start your first scan using the controls above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedSessions.map((session) => (
                  <div key={session.session_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-surface-hover">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(session.status)}</span>
                      <div>
                        <div className="font-medium">{formatScanType(session)}</div>
                        <div className="text-sm text-muted">
                          Started: {formatDateTime(session.started_at)}
                        </div>
                        <div className="text-sm text-muted">
                          Duration: {calculateDuration(session.started_at, session.completed_at)}
                        </div>
                        {session.target && (
                          <div className="text-sm text-muted">
                            Target: {session.target}
                          </div>
                        )}
                        {session.error_message && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {session.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status.toLowerCase() === 'done' || session.status.toLowerCase() === 'complete' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : session.status.toLowerCase() === 'failed' || session.status.toLowerCase() === 'error'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {session.status}
                      </div>
                      {(session.status.toLowerCase() === 'done' || session.status.toLowerCase() === 'complete') && (
                        <Link 
                          to={`/organizations/${slug}/nodes/${nodeId}/scans/${session.session_id}`}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors no-underline"
                        >
                          results
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Smart Scan Modal */}
      <Dialog open={smartScanModalOpen} onOpenChange={setSmartScanModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Smart Scan</DialogTitle>
            <DialogDescription>
              Smart Scan performs a dynamic, adaptive assessment tailored to your node. It takes into account your node type, previous scan results, and network context to decide what to run — ensuring only the most relevant checks are executed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="text-sm">
                This isn't a fixed scan. It's an intelligent workflow that adjusts based on what your infrastructure actually needs.
              </div>
              <div className="text-sm font-medium">
                Typical runtime: 2–4 minutes
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmartScanModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSmartScanModalOpen(false)}>
              Start Smart Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NodeMainLayout>
  );
};

export default OrgNodeScans;