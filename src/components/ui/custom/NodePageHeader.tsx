import React from 'react';
import { Button } from '@/components/ui/button';
import { Radar } from 'lucide-react';

interface NodePageHeaderProps {
  node: {
    name?: string;
    protocol_details?: {
      name?: string;
      display_name?: string;
      category?: string;
    };
  };
  onStartScan?: () => void;
  showScanButton?: boolean;
}

export const NodePageHeader: React.FC<NodePageHeaderProps> = ({ 
  node, 
  onStartScan, 
  showScanButton = true 
}) => {
  const getProtocolColor = (protocol: string): string => {
    switch (protocol?.toLowerCase()) {
      case 'sui':
        return 'bg-blue-600 text-white';
      case 'ethereum':
        return 'bg-gray-800 text-white';
      case 'polygon':
        return 'bg-purple-600 text-white';
      case 'bitcoin':
        return 'bg-orange-500 text-white';
      case 'solana':
        return 'bg-green-600 text-white';
      case 'cardano':
        return 'bg-blue-800 text-white';
      case 'polkadot':
        return 'bg-pink-600 text-white';
      case 'avalanche':
        return 'bg-red-600 text-white';
      case 'cosmos':
        return 'bg-indigo-600 text-white';
      case 'near':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-orange-400 text-white'; // unknown
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category?.toLowerCase()) {
      case 'validator':
        return 'bg-blue-600 text-white';
      case 'rpc':
        return 'bg-green-600 text-white';
      case 'api':
        return 'bg-purple-600 text-white';
      case 'indexer':
        return 'bg-indigo-600 text-white';
      case 'oracle':
        return 'bg-yellow-600 text-white';
      case 'bridge':
        return 'bg-pink-600 text-white';
      case 'defi':
        return 'bg-emerald-600 text-white';
      case 'wallet':
        return 'bg-gray-600 text-white';
      case 'explorer':
        return 'bg-cyan-600 text-white';
      case 'infrastructure':
        return 'bg-slate-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const protocol = node?.protocol_details?.name || node?.protocol_details?.display_name || 'unknown';
  const category = node?.protocol_details?.category || 'unknown';

  const getProtocolLogo = (protocol: string): string => {
    switch (protocol?.toLowerCase()) {
      case 'sui':
        return '/sui-logo.svg';
      default:
        return '/sui-logo.svg'; // fallback to sui logo for now
    }
  };

  return (
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <img 
            alt={`${protocol} Network logo`} 
            className="h-8 w-8" 
            src={getProtocolLogo(protocol)}
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {node?.name || 'Unknown Node'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span 
            className={`px-2 py-1 rounded text-xs font-semibold ${getProtocolColor(protocol)}`}
            title={`Protocol: ${protocol}`}
          >
            {protocol}
          </span>
          {category && category !== 'unknown' && (
            <span 
              className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(category)}`}
              title={`Category: ${category}`}
              data-state="closed"
            >
              {category}
            </span>
          )}
        </div>
      </div>
      {showScanButton && onStartScan && (
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3 items-center">
          <Button
            onClick={onStartScan}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Radar className="w-4 h-4 mr-1 text-white" />
            Scan
          </Button>
        </div>
      )}
    </div>
  );
};
