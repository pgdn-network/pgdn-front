import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  Server, 
  Globe, 
  Shield, 
  ArrowRight,
  Zap
} from 'lucide-react';
import type { Node } from '@/types/node';
import { useProtocols } from '@/contexts/ProtocolsContext';

interface DiscoveryResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScan: () => void;
  node: Node;
}

export const DiscoveryResultsModal: React.FC<DiscoveryResultsModalProps> = ({
  isOpen,
  onClose,
  onStartScan,
  node
}) => {
  const { getProtocol } = useProtocols();

  // Get protocol information for display
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

  const logo = protocol ? getLogo(protocol.name) : null;

  const handleStartScanAndClose = () => {
    onStartScan();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Discovery Complete!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your node has been successfully discovered and analyzed
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Node Overview Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3">
                {logo && (
                  <img 
                    src={logo} 
                    alt={`${protocol?.display_name || 'Protocol'} logo`}
                    className="h-10 w-10"
                  />
                )}
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Server className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {node.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {node.address}
                </p>
                {protocol && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Protocol: {protocol.display_name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Discovery Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Network Information */}
            {node.network && (
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Network</h4>
                </div>
                <Badge 
                  variant={node.network === 'mainnet' ? 'default' : 'secondary'}
                  className={node.network === 'mainnet' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}
                >
                  {node.network}
                </Badge>
              </Card>
            )}

            {/* Node Type */}
            {node.node_type && (
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Node Type</h4>
                </div>
                <Badge 
                  className={`
                    ${node.node_type === 'validator' ? 'bg-blue-600 text-white' : ''}
                    ${node.node_type === 'public_rpc' ? 'bg-purple-600 text-white' : ''}
                    ${node.node_type === 'hybrid' ? 'bg-teal-600 text-white' : ''}
                  `}
                >
                  {node.node_type}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {node.node_type === 'validator' && 'Responsible for consensus and block production'}
                  {node.node_type === 'public_rpc' && 'Provides public RPC access for the network'}
                  {node.node_type === 'hybrid' && 'Acts as both validator and public RPC node'}
                </p>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          <Card className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/50">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Ready for Deep Scanning
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your node is now ready for comprehensive scanning. Run a deep discovery scan 
                  to perform thorough security analysis and compliance checks.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Recommended: Start with a deep discovery scan</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            View Node Details
          </Button>
          <Button onClick={handleStartScanAndClose} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Start Deep Discovery Scan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 