import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Check, AlertCircle, Shield, Globe, Database, Zap, Coins, Network, Cpu, HardDrive, Link, FileText, Layers, Activity, Star, Hexagon, Circle, Square, Triangle, Diamond } from 'lucide-react';

interface Protocol {
  id: string;
  name: string;
  description?: string;
}

interface ProtocolSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (protocols: Protocol[]) => void;
  protocols: Protocol[];
  maxSelection?: number;
  detectedProtocols?: string[]; // Array of protocol IDs that were detected during discovery
}

// Protocol icons mapping
const getProtocolIcon = (protocolId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    // Major Layer 1s
    bitcoin: <Coins className="h-5 w-5" />,
    ethereum: <Globe className="h-5 w-5" />,
    solana: <Zap className="h-5 w-5" />,
    cardano: <Shield className="h-5 w-5" />,
    polkadot: <Network className="h-5 w-5" />,
    polygon: <Layers className="h-5 w-5" />,
    avalanche: <Activity className="h-5 w-5" />,
    binance_smart_chain: <Database className="h-5 w-5" />,
    cosmos: <Circle className="h-5 w-5" />,
    chainlink: <Link className="h-5 w-5" />,
    filecoin: <HardDrive className="h-5 w-5" />,
    tezos: <Hexagon className="h-5 w-5" />,
    algorand: <Cpu className="h-5 w-5" />,
    stellar: <Star className="h-5 w-5" />,
    ripple: <Square className="h-5 w-5" />,
    xrp: <Square className="h-5 w-5" />,
    sui: <Shield className="h-5 w-5" />,
    aptos: <Database className="h-5 w-5" />,
    near: <Triangle className="h-5 w-5" />,
    
    // Layer 2s
    arbitrum: <Layers className="h-5 w-5" />,
    optimism: <Layers className="h-5 w-5" />,
    base: <Layers className="h-5 w-5" />,
    mantle: <Layers className="h-5 w-5" />,
    scroll: <Layers className="h-5 w-5" />,
    zksync: <Layers className="h-5 w-5" />,
    linea: <Layers className="h-5 w-5" />,
    
    // Other major protocols
    celo: <Globe className="h-5 w-5" />,
    harmony: <Network className="h-5 w-5" />,
    fantom: <Zap className="h-5 w-5" />,
    klaytn: <Database className="h-5 w-5" />,
    icon: <Network className="h-5 w-5" />,
    vechain: <Database className="h-5 w-5" />,
    neo: <Cpu className="h-5 w-5" />,
    ontology: <Database className="h-5 w-5" />,
    waves: <Activity className="h-5 w-5" />,
    qtum: <Database className="h-5 w-5" />,
    eos: <Cpu className="h-5 w-5" />,
    tron: <Activity className="h-5 w-5" />,
    iota: <Network className="h-5 w-5" />,
    nano: <Zap className="h-5 w-5" />,
    monero: <Shield className="h-5 w-5" />,
    zcash: <Shield className="h-5 w-5" />,
    dash: <Zap className="h-5 w-5" />,
    litecoin: <Coins className="h-5 w-5" />,
    bitcoin_cash: <Coins className="h-5 w-5" />,
    
    // Handle variations in naming
    'binance-smart-chain': <Database className="h-5 w-5" />,
    'bitcoin-cash': <Coins className="h-5 w-5" />,
  };
  return iconMap[protocolId.toLowerCase()] || <Diamond className="h-5 w-5" />;
};

export const ProtocolSelectModal: React.FC<ProtocolSelectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  protocols, 
  maxSelection = 3,
  detectedProtocols = []
}) => {
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);

  // Pre-select detected protocols when modal opens
  React.useEffect(() => {
    if (isOpen && detectedProtocols.length > 0) {
      setSelectedProtocols(detectedProtocols);
    }
  }, [isOpen, detectedProtocols]);

  if (!isOpen) return null;

  const handleProtocolToggle = (protocolId: string) => {
    setSelectedProtocols(prev => {
      if (prev.includes(protocolId)) {
        return prev.filter(id => id !== protocolId);
      } else {
        if (prev.length >= maxSelection) {
          return prev;
        }
        return [...prev, protocolId];
      }
    });
  };

  const handleConfirm = () => {
    const selectedProtocolsList = protocols.filter(p => selectedProtocols.includes(p.id));
    onSelect(selectedProtocolsList);
    setSelectedProtocols([]);
  };

  const handleClose = () => {
    setSelectedProtocols([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Protocols</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose up to {maxSelection} protocols for your node
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Selection Info */}
          {selectedProtocols.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedProtocols.length} of {maxSelection} protocols selected
                  </span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                  {selectedProtocols.length}/{maxSelection}
                </Badge>
              </div>
            </div>
          )}

          {/* Detected Protocols Info */}
          {detectedProtocols.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Discovery Results
                </span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                We detected {detectedProtocols.length} protocol{detectedProtocols.length !== 1 ? 's' : ''} during discovery. 
                These are pre-selected for you.
              </p>
            </div>
          )}

          {/* Protocols Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map((protocol) => {
              const isSelected = selectedProtocols.includes(protocol.id);
              const isDisabled = !isSelected && selectedProtocols.length >= maxSelection;
              const isDetected = detectedProtocols.includes(protocol.id);
              
              return (
                <Card
                  key={protocol.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected 
                      ? isDetected
                        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                      : isDetected
                      ? 'ring-1 ring-green-300 bg-green-25 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => !isDisabled && handleProtocolToggle(protocol.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? isDetected
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
                          : isDetected
                          ? 'bg-green-50 dark:bg-green-700 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {getProtocolIcon(protocol.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {protocol.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {isDetected && (
                              <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs">
                                Detected
                              </Badge>
                            )}
                            {isSelected && (
                              <div className="flex-shrink-0 ml-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  isDetected ? 'bg-green-500' : 'bg-blue-500'
                                }`}>
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {protocol.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {protocol.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Warning when max reached */}
          {selectedProtocols.length >= maxSelection && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  Maximum of {maxSelection} protocols selected. Deselect one to choose another.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedProtocols.length > 0 ? (
              <span>Ready to proceed with {selectedProtocols.length} protocol{selectedProtocols.length !== 1 ? 's' : ''}</span>
            ) : (
              <span>Please select at least one protocol</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedProtocols.length === 0}
            >
              Confirm Selection ({selectedProtocols.length})
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 