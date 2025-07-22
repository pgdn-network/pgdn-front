import React from 'react';

interface NodeProtocolTagsProps {
  node: {
    protocol_details?: {
      name?: string;
      display_name?: string;
      category?: string;
    };
  };
  className?: string;
}

export const NodeProtocolTags: React.FC<NodeProtocolTagsProps> = ({ node, className = "flex flex-wrap gap-2 mb-4" }) => {
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

  return (
    <div className={className}>
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
        >
          {category}
        </span>
      )}
    </div>
  );
};
