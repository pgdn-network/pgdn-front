import React, { useState } from 'react';
import { Settings, AlertTriangle, RefreshCw, Network, Shield, Zap, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [isRetryingDiscovery, setIsRetryingDiscovery] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState(node?.address || '');
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
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

  const handleRetryDiscovery = async () => {
    if (!user?.org_uuid) {
      console.error('No organization UUID available');
      return;
    }
    
    setIsRetryingDiscovery(true);
    setRetryError(null); // Clear any previous errors
    
    try {
      // First, reset the node discovery status to pending
      await NodeApiService.patchNode(user.org_uuid, node.uuid, {
        discovery_status: 'pending'
      });
      
      // Then trigger a new discovery scan
      await NodeApiService.startNodeScan(user.org_uuid, node.uuid, ['discovery']);
      
      console.log('✅ Discovery scan restarted successfully');
      
      // Reload the page after a short delay to show the progress
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to retry discovery:', error);
      setRetryError('Failed to restart discovery scan. Please try again.');
    } finally {
      setIsRetryingDiscovery(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!user?.org_uuid || !newAddress.trim()) {
      console.error('No organization UUID available or address is empty');
      return;
    }
    
    setIsUpdatingAddress(true);
    try {
      // Update the node address
      await NodeApiService.patchNode(user.org_uuid, node.uuid, {
        address: newAddress.trim()
      });
      
      console.log('✅ Node address updated successfully');
      setIsAddressModalOpen(false);
      
      // Reload the page to reflect the new address
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Failed to update node address:', error);
      // TODO: Show error notification to user
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Discovery Failed</h1>
        <p className="text-base text-muted-foreground">
          We couldn't automatically detect your node {node?.name}. Let's help you configure it manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* What Happened Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-medium">What happened?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The discovery process couldn't automatically identify the protocol and services running on your node.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center">
              <Network className="h-3 w-3 mr-2 text-blue-500" />
              Network connectivity issues
            </li>
            <li className="flex items-center">
              <Shield className="h-3 w-3 mr-2 text-blue-500" />
              Firewall blocking access
            </li>
            <li className="flex items-center">
              <Settings className="h-3 w-3 mr-2 text-blue-500" />
              Non-standard configuration
            </li>
            <li className="flex items-center">
              <Zap className="h-3 w-3 mr-2 text-blue-500" />
              Service not responding
            </li>
          </ul>
        </div>

        {/* Node Details Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Network className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-medium">Node Details</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{node?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{node?.address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{node?.simple_state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discovery:</span>
              <span className="px-2 inline-flex text-xs leading-5 rounded-full bg-red-100 text-red-800">
                Failed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Manual Configuration Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-base font-medium mb-2">Configure Manually</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select your blockchain protocol and configure the connection settings.
            </p>
            <Button 
              onClick={() => setIsProtocolModalOpen(true)}
              disabled={isUpdating}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isUpdating ? 'Configuring...' : 'Configure Protocol'}
            </Button>
          </div>
        </div>

        {/* Retry Discovery Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-base font-medium mb-2">Try Again</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Check your node configuration and try the discovery process again.
            </p>
            
            {/* Error Alert */}
            {retryError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{retryError}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              variant="outline"
              onClick={handleRetryDiscovery}
              disabled={isRetryingDiscovery}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetryingDiscovery ? 'animate-spin' : ''}`} />
              {isRetryingDiscovery ? 'Starting Discovery...' : 'Retry Discovery'}
            </Button>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-base font-medium mb-4">Troubleshooting Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Check Network Access</p>
                <p className="text-xs text-muted-foreground">
                  Ensure your node is accessible from the internet
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Verify Service Status</p>
                <p className="text-xs text-muted-foreground">
                  Confirm your blockchain node is running
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Review Firewall Settings</p>
                <p className="text-xs text-muted-foreground">
                  Check if ports are blocked by firewall rules
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Check Configuration</p>
                <p className="text-xs text-muted-foreground">
                  Verify ports and protocol settings are correct
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProtocolSelectModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        onSelect={handleProtocolSelect}
        protocols={modalProtocols}
        detectedProtocols={detectedProtocols}
      />

      {/* Update Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Node Address</DialogTitle>
            <DialogDescription>
              Enter the correct address for your node. This should be the IP address or hostname where your node is accessible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Node Address</Label>
              <Input
                id="address"
                placeholder="e.g., 192.168.1.100 or mynode.example.com"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                disabled={isUpdatingAddress}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddressModalOpen(false);
                setNewAddress(node?.address || '');
              }}
              disabled={isUpdatingAddress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAddress}
              disabled={isUpdatingAddress || !newAddress.trim() || newAddress === node?.address}
            >
              {isUpdatingAddress ? 'Updating...' : 'Update Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 