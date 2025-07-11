import React, { useState } from 'react';
import { Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtocolSelectModal } from './ProtocolSelectModal';
import { NodeApiService } from '@/api/nodes';
import { useAuth } from '@/hooks/useAuth';
import { useProtocols } from '@/contexts/ProtocolsContext';

interface DiscoveryFailureProps {
  node: any;
  organization: any;
}

export const DiscoveryFailure: React.FC<DiscoveryFailureProps> = ({ node, organization }) => {
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { protocols } = useProtocols();

  // Extract detected protocols from node data (likely empty in failure cases)
  const detectedProtocols = node?.protocol_details?.uuid ? [node.protocol_details.uuid] : [];

  // Convert real protocols to the format expected by ProtocolSelectModal
  const modalProtocols = protocols.map(protocol => ({
    id: protocol.uuid, // Use UUID as id
    name: protocol.display_name,
    description: `${protocol.category.replace(/_/g, ' ')} protocol`
  }));

  const handleProtocolSelect = async (selectedProtocols: any[]) => {
    setIsProtocolModalOpen(false);
    if (!user?.org_uuid) {
      console.error('No organization UUID available');
      return;
    }
    
    setIsUpdating(true);
    try {
      // Update node with selected protocols and activate it
      const updateData: any = { 
        simple_state: 'active',
        discovery_status: 'completed'
      };
      if (selectedProtocols && selectedProtocols.length > 0) {
        // selectedProtocols.map(p => p.id) now returns UUIDs since p.id is the protocol UUID
        updateData.node_protocols = selectedProtocols.map(p => p.id);
      }
      
      await NodeApiService.patchNode(user.org_uuid, node.uuid, updateData);
      console.log('✅ Node updated successfully with protocol UUIDs:', selectedProtocols.map(p => p.id));
      
      // Redirect to the main node page
      window.location.href = `/organizations/${organization.slug}/nodes/${node.uuid}`;
    } catch (error) {
      console.error('Failed to update node with protocols:', error);
      // TODO: Show error notification to user
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium mb-2">What happened?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The discovery process couldn't automatically identify the protocol and services running on your node. This can happen for several reasons:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Network connectivity issues
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Firewall blocking access
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Non-standard protocol configuration
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Service not running on expected ports
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-base font-medium mb-4">Node Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Name:</span>
              <span className="text-xs">{node?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Address:</span>
              <span className="text-xs">{node?.address}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className="text-xs">{node?.simple_state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Discovery:</span>
              <span className="px-2 inline-flex text-xs leading-5 rounded-full bg-red-100 text-red-800">
                Failed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-base font-medium mb-2">Manual Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You can manually configure your node by selecting the protocol and services it's running.
          </p>
          <Button 
            size="lg"
            onClick={() => setIsProtocolModalOpen(true)}
            disabled={isUpdating}
            className="px-8"
          >
            <Settings className="h-5 w-5 mr-2" />
            {isUpdating ? 'Updating...' : 'Configure Protocol'}
          </Button>
        </div>
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