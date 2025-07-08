import React, { useState } from 'react';
import { AlertTriangle, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtocolSelectModal } from './ProtocolSelectModal';

interface DiscoveryFailureProps {
  node: any;
  organization: any;
}

// Comprehensive list of blockchain protocols
const mockProtocols = [
  { id: 'bitcoin', name: 'Bitcoin', description: 'The original decentralized cryptocurrency and blockchain protocol' },
  { id: 'ethereum', name: 'Ethereum', description: 'Smart contract platform and decentralized application network' },
  { id: 'solana', name: 'Solana', description: 'High-performance blockchain with fast transaction processing' },
  { id: 'cardano', name: 'Cardano', description: 'Research-driven blockchain platform with proof-of-stake consensus' },
  { id: 'polkadot', name: 'Polkadot', description: 'Multi-chain network enabling cross-blockchain transfers' },
  { id: 'polygon', name: 'Polygon', description: 'Ethereum scaling solution and multi-chain network' },
  { id: 'avalanche', name: 'Avalanche', description: 'High-throughput blockchain platform with sub-second finality' },
  { id: 'binance-smart-chain', name: 'BNB Smart Chain', description: 'Ethereum-compatible blockchain by Binance' },
  { id: 'cosmos', name: 'Cosmos', description: 'Interoperable blockchain ecosystem and network' },
  { id: 'chainlink', name: 'Chainlink', description: 'Decentralized oracle network for smart contracts' },
  { id: 'filecoin', name: 'Filecoin', description: 'Decentralized storage network and cryptocurrency' },
  { id: 'tezos', name: 'Tezos', description: 'Self-amending blockchain with on-chain governance' },
  { id: 'algorand', name: 'Algorand', description: 'Pure proof-of-stake blockchain with instant finality' },
  { id: 'stellar', name: 'Stellar', description: 'Open-source payment protocol for financial services' },
  { id: 'ripple', name: 'Ripple', description: 'Real-time gross settlement system and cryptocurrency' },
  { id: 'sui', name: 'Sui', description: 'Layer 1 blockchain with parallel transaction processing' },
  { id: 'aptos', name: 'Aptos', description: 'Layer 1 blockchain with Move programming language' },
  { id: 'near', name: 'NEAR Protocol', description: 'Sharded proof-of-stake blockchain with human-readable accounts' },
  { id: 'arbitrum', name: 'Arbitrum', description: 'Layer 2 scaling solution for Ethereum' },
  { id: 'optimism', name: 'Optimism', description: 'Layer 2 scaling solution using optimistic rollups' },
  { id: 'base', name: 'Base', description: 'Layer 2 blockchain built on Ethereum by Coinbase' },
  { id: 'mantle', name: 'Mantle', description: 'Modular Layer 2 network with optimistic rollups' },
  { id: 'scroll', name: 'Scroll', description: 'Ethereum-equivalent zkEVM Layer 2 scaling solution' },
  { id: 'zksync', name: 'zkSync', description: 'Layer 2 scaling solution using zero-knowledge proofs' },
  { id: 'linea', name: 'Linea', description: 'Ethereum-equivalent zkEVM by ConsenSys' },
  { id: 'celo', name: 'Celo', description: 'Mobile-first blockchain platform for financial inclusion' },
  { id: 'harmony', name: 'Harmony', description: 'Sharded blockchain with fast finality and low fees' },
  { id: 'fantom', name: 'Fantom', description: 'High-performance smart contract platform' },
  { id: 'klaytn', name: 'Klaytn', description: 'Enterprise-focused blockchain platform by Kakao' },
  { id: 'icon', name: 'ICON', description: 'Blockchain platform for interconnecting independent blockchains' },
  { id: 'vechain', name: 'VeChain', description: 'Enterprise-focused blockchain for supply chain management' },
  { id: 'neo', name: 'NEO', description: 'Smart economy blockchain platform' },
  { id: 'ontology', name: 'Ontology', description: 'High-performance public blockchain for identity and data' },
  { id: 'waves', name: 'Waves', description: 'Blockchain platform for custom tokens and dApps' },
  { id: 'qtum', name: 'Qtum', description: 'Hybrid blockchain combining Bitcoin and Ethereum' },
  { id: 'eos', name: 'EOS', description: 'Blockchain platform for decentralized applications' },
  { id: 'tron', name: 'TRON', description: 'Decentralized content sharing platform' },
  { id: 'iota', name: 'IOTA', description: 'Distributed ledger for Internet of Things' },
  { id: 'nano', name: 'Nano', description: 'Lightweight cryptocurrency with instant transactions' },
  { id: 'monero', name: 'Monero', description: 'Privacy-focused cryptocurrency with confidential transactions' },
  { id: 'zcash', name: 'Zcash', description: 'Privacy-protecting cryptocurrency with selective transparency' },
  { id: 'dash', name: 'Dash', description: 'Digital cash with instant and private transactions' },
  { id: 'litecoin', name: 'Litecoin', description: 'Peer-to-peer cryptocurrency and open source software' },
  { id: 'bitcoin-cash', name: 'Bitcoin Cash', description: 'Peer-to-peer electronic cash system' },
  { id: 'stellar', name: 'Stellar', description: 'Open-source payment protocol for financial services' },
  { id: 'xrp', name: 'XRP', description: 'Digital asset for payments and remittances' },
];

export const DiscoveryFailure: React.FC<DiscoveryFailureProps> = ({ node, organization }) => {
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  const handleProtocolSelect = (protocols: any[]) => {
    console.log('Selected protocols:', protocols);
    setIsProtocolModalOpen(false);
    // TODO: Update node with selected protocols and redirect to main node page
    // For now, just log the selection
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