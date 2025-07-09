import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { NodeTabNav } from '@/components/ui/custom/NodeTabNav';
import { Link } from 'react-router-dom';

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
  onStartScan, 
  snapshotData
}) => {
  const { getProtocol } = useProtocols();

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {node.name}
            </h1>
            <p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
              Detailed information and metrics for this node in {organization?.name}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button 
              onClick={onStartScan}
              disabled={!(node.simple_state === 'active' && node.discovery_status === 'completed')}
            >
              Start Scan
            </Button>
            <Button variant="outline">
              Settings
            </Button>
          </div>
        </div>
        
        <NodeTabNav organizationSlug={organization?.slug} nodeId={nodeId} />
        
        {/* Node Overview Cards removed. Status and Node Information cards should be rendered in the main node details page instead. */}
      </div>
    </div>
  );
}; 