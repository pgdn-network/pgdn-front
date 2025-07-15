import React from 'react';
import { Button } from '@/components/ui/button';
import { NodeTabNav } from '@/components/ui/custom/NodeTabNav';

import { Radar } from 'lucide-react';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface NodeOverviewProps {
  node: any;
  organization: any;
  nodeId: string;
  onStartScan: () => void;
  snapshotData?: any;
}

export const NodeOverview: React.FC<NodeOverviewProps> = ({ 
  node, 
  organization, 
  nodeId, 
  onStartScan
}) => {
  const { getProtocol } = useProtocols();

  // Get protocol information for logo - check both protocols array and protocol_details
  const protocolUuid = node?.protocols?.[0] || node?.protocol_details?.uuid;
  const protocol = protocolUuid ? getProtocol(protocolUuid) : null;
  
  // Get logo based on protocol name
  const getLogo = (protocolName: string) => {
    const normalizedName = protocolName.toLowerCase();
    if (normalizedName.includes('sui')) {
      return '/sui-logo.svg';
    }
    // Add more protocol logos as they become available
    return null;
  };

  // Extract network and node type from node data - they're at the root level
  const network = node?.network;
  const nodeType = node?.node_type;
  
  const logo = protocol ? getLogo(protocol.name) : null;

  if (!node || !node.name) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Node Not Found</h1>
          <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">No node data available or node is not active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {logo && (
                <img 
                  src={logo} 
                  alt={`${protocol?.display_name || 'Protocol'} logo`}
                  className="h-8 w-8"
                />
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {node.name}
              </h1>
            </div>
            
            {/* Badges for network and node type */}
            <div className="flex flex-wrap gap-2 mb-4">
              {network && (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold 
                    ${network === 'mainnet' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}`}
                >
                  {network}
                </span>
              )}
              {nodeType && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold 
                          ${nodeType === 'validator' ? 'bg-blue-600 text-white' : ''}
                          ${nodeType === 'public_rpc' ? 'bg-purple-600 text-white' : ''}
                          ${nodeType === 'hybrid' ? 'bg-teal-600 text-white' : ''}
                        `}
                      >
                        {nodeType}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {nodeType === 'validator' && 'This node is a validator, responsible for consensus and block production.'}
                      {nodeType === 'public_rpc' && 'This node provides public RPC access for the network.'}
                      {nodeType === 'hybrid' && 'This node acts as both a validator and a public RPC node.'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {(!network && !nodeType) && (
              <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                Detailed information and metrics for this node in {organization?.name}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button 
              onClick={onStartScan}
              disabled={!(node.simple_state === 'active' && node.discovery_status === 'completed')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Radar className="w-4 h-4 mr-1 text-white" />
              Scan
            </Button>
          </div>
        </div>
        
        <NodeTabNav organizationSlug={organization?.slug} nodeId={nodeId} />
        
        {/* Node Overview Cards removed. Status and Node Information cards should be rendered in the main node details page instead. */}
      </div>
    </div>
  );
}; 