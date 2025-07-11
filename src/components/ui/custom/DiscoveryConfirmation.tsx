import React, { useState } from 'react';
import { CheckCircle, Search, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtocolSelectModal } from './ProtocolSelectModal';
import { NodeApiService } from '@/api/nodes';
import { useAuth } from '@/hooks/useAuth';
import { useProtocols } from '@/contexts/ProtocolsContext';

interface DiscoveryConfirmationProps {
  node: any;
  organization: any;
}

// Helper to update node state (optionally with protocols)
async function updateNodeState({ orgUuid, nodeUuid, simpleState, discoveryStatus, nodeProtocols }: {
  orgUuid: string;
  nodeUuid: string;
  simpleState: string;
  discoveryStatus?: string;
  nodeProtocols?: string[];
}) {
  const updateData: any = { simple_state: simpleState };
  if (discoveryStatus) {
    updateData.discovery_status = discoveryStatus;
  }
  if (nodeProtocols) {
    updateData.node_protocols = nodeProtocols;
  }
  await NodeApiService.patchNode(orgUuid, nodeUuid, updateData);
}

export const DiscoveryConfirmation: React.FC<DiscoveryConfirmationProps> = ({ node, organization }) => {
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { protocols } = useProtocols();

  // Extract detected protocols from node data
  const detectedProtocols = node?.protocol_details?.uuid ? [node.protocol_details.uuid] : [];

  // Convert real protocols to the format expected by ProtocolSelectModal
  const modalProtocols = protocols.map(protocol => ({
    id: protocol.uuid, // Use UUID as id
    name: protocol.display_name,
    description: `${protocol.category.replace(/_/g, ' ')} protocol`
  }));

  const handleAcceptAndContinue = async () => {
    if (!user?.org_uuid) {
      console.error('No organization UUID available');
      return;
    }

    setIsUpdating(true);
    try {
      // Only update state, do NOT send node_protocols
      await updateNodeState({
        orgUuid: user.org_uuid,
        nodeUuid: node.uuid,
        simpleState: 'active',
        discoveryStatus: 'completed',
      });

      console.log('✅ Node updated successfully (no protocol change)');
      window.location.href = `/organizations/${organization.slug}/nodes/${node.uuid}`;
    } catch (error) {
      console.error('Failed to update node:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProtocolSelect = async (selectedProtocols: any[]) => {
    setIsProtocolModalOpen(false);
    if (!user?.org_uuid) {
      console.error('No organization UUID available');
      return;
    }
    setIsUpdating(true);
    try {
      // Only send node_protocols if user updated them
      await updateNodeState({
        orgUuid: user.org_uuid,
        nodeUuid: node.uuid,
        simpleState: 'active',
        discoveryStatus: 'completed',
        nodeProtocols: selectedProtocols.map(p => p.id), // Now p.id is the protocol UUID
      });
      console.log('✅ Node updated successfully with protocol UUIDs:', selectedProtocols.map(p => p.id));
      window.location.href = `/organizations/${organization.slug}/nodes/${node.uuid}`;
    } catch (error) {
      console.error('Failed to update node with protocols:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Discovery Complete</h1>
        <p className="text-base text-muted-foreground">
          We've successfully discovered your node {node?.name} in {organization?.name}. Please review the findings below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-base font-medium">Discovery Results</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The discovery process has completed successfully. Here's what we found:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="px-2 inline-flex text-xs leading-5 rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            </div>
            <div className="flex justify-between">
              <span>Endpoints Found:</span>
              <span>{node?.protocol_details?.endpoints?.length || 3}</span>
            </div>
            <div className="flex justify-between">
              <span>Ports Scanned:</span>
              <span>{node?.protocol_details?.ports?.join(', ') || '8080, 9000, 9001'}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span>{node?.protocol_details?.display_name || 'Sui'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-medium">Next Steps</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-xs">Discovery completed successfully</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-xs">Review discovery results</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-xs">Confirm or modify findings</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-xs text-muted-foreground">Proceed to security scanning</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" size="lg" onClick={() => setIsProtocolModalOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Edit Discovery
        </Button>
        <Button size="lg" onClick={handleAcceptAndContinue} disabled={isUpdating}>
          <ArrowRight className="h-4 w-4 mr-2" />
          {isUpdating ? 'Updating...' : 'Accept & Continue'}
        </Button>
      </div>

      <ProtocolSelectModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        onSelect={handleProtocolSelect}
        protocols={modalProtocols}
        detectedProtocols={detectedProtocols}
      />
    </>
  );
}; 