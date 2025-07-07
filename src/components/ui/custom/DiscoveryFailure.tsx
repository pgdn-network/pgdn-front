import React, { useState } from 'react';
import { AlertTriangle, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtocolSelectModal } from './ProtocolSelectModal';

interface DiscoveryFailureProps {
  node: any;
  organization: any;
}

// Mock protocols for testing
const mockProtocols = [
  { id: 'sui', name: 'Sui', description: 'Sui blockchain protocol' },
  { id: 'aptos', name: 'Aptos', description: 'Aptos blockchain protocol' },
  { id: 'solana', name: 'Solana', description: 'Solana blockchain protocol' },
  { id: 'ethereum', name: 'Ethereum', description: 'Ethereum blockchain protocol' },
  { id: 'bitcoin', name: 'Bitcoin', description: 'Bitcoin blockchain protocol' },
];

export const DiscoveryFailure: React.FC<DiscoveryFailureProps> = ({ node, organization }) => {
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  const handleProtocolSelect = (protocol: any) => {
    console.log('Selected protocol:', protocol);
    setIsProtocolModalOpen(false);
    // TODO: Update node with selected protocol and redirect to main node page
    // For now, just log the selection
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Failed</h1>
        <p className="text-lg text-muted-foreground">
          We couldn't automatically discover your node {node?.name}, but that's OK!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">What happened?</h3>
            <p className="text-muted-foreground mb-4">
              The discovery process couldn't automatically identify the protocol and services running on your node. This can happen for several reasons:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
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
        <h3 className="text-lg font-semibold mb-4">Node Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="text-sm font-medium">{node?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-sm font-medium">{node?.address}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="text-sm font-medium">{node?.simple_state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Discovery:</span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Failed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Manual Configuration</h3>
          <p className="text-muted-foreground mb-6">
            You can manually configure your node by selecting the protocol and services it's running.
          </p>
          <Button 
            size="lg"
            onClick={() => setIsProtocolModalOpen(true)}
            className="px-8"
          >
            <Settings className="h-5 w-5 mr-2" />
            Configure Protocol
          </Button>
        </div>
      </div>

      <ProtocolSelectModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        onSelect={handleProtocolSelect}
        protocols={mockProtocols}
      />
    </>
  );
}; 