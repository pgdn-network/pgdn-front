import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';

import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { useBasicNodeData } from '@/hooks/useNodeData';
import { useNodeDiscoverySubscription } from '@/hooks/useWebSocketSubscription';
import { useNodeScansPolling } from '@/hooks/useNodeScansPolling';

import { NodeStatusCard } from '@/components/ui/custom/NodeStatusCard';
import { NodeInfoCard } from '@/components/ui/custom/NodeInfoCard';

const NodeDetail: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { loading: orgsLoading } = useOrganizations();
  const { protocols } = useProtocols();

  // Get node data - for public nodes, we might need a different API endpoint
  // This is a placeholder implementation as NodeDetail.tsx doesn't appear to be actively used
  const {
    node,
    loading: basicLoading,
    error
  } = useBasicNodeData('', nodeId || ''); // Empty organization UUID for public nodes

  const loading = basicLoading;

  // For now, we'll use empty organization UUID for public nodes
  // You may need to adjust this based on your API design for public nodes
  const { scans, loading: scansLoading, refresh: refreshScans } = useNodeScansPolling('', nodeId || '');

  // Listen for WebSocket messages and refresh tasks when scan completes
  const discoveryMessage = useNodeDiscoverySubscription(nodeId || '');
  
  useEffect(() => {
    if (discoveryMessage && (discoveryMessage.type === 'scan_completed' || discoveryMessage.type === 'scan_failed')) {
      console.log('WebSocket scan message received, refreshing scans:', discoveryMessage.type);
      refreshScans();
    }
  }, [discoveryMessage, refreshScans]);

  const getProtocol = (protocolId: string) => {
    return protocols.find(p => p.uuid === protocolId) || null;
  };

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading node data...</span>
        </div>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'Node not found'}
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NodeMainLayout
        node={node}
        organization={null} // No organization for public nodes
        nodeId={nodeId || ''}
        slug=""
        onStartScan={() => {}} // No scan functionality for public nodes
        cveData={null}
        eventsData={null}
        scanSessionsData={null}
        reportsData={null}
        snapshotData={null}
        actionsData={null}
        loading={loading}
        tasks={scans}
        tasksLoading={scansLoading}
      >
        {/* Status and Node Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <NodeStatusCard node={node} getProtocol={getProtocol} />
          <NodeInfoCard node={node} snapshotData={null} />
        </div>

        {/* Additional content would go here for public node details */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Public node details implementation - tasks are being polled every 15 seconds.
          </p>
        </div>
      </NodeMainLayout>
    </div>
  );
};

export default NodeDetail;

