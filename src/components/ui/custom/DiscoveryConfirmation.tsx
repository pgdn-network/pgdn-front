import React, { useState } from 'react';
import { CheckCircle, Search, Shield, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtocolSelectModal } from './ProtocolSelectModal';

interface DiscoveryConfirmationProps {
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

export const DiscoveryConfirmation: React.FC<DiscoveryConfirmationProps> = ({ node, organization }) => {
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  const handleAcceptAndContinue = () => {
    console.log('Accept and continue clicked');
    // TODO: Update node status and redirect to main node page
    // For now, just log the action
  };

  const handleProtocolSelect = (protocols: any[]) => {
    console.log('Selected protocols:', protocols);
    setIsProtocolModalOpen(false);
    // TODO: Update node with selected protocols and redirect to main node page
    // For now, just log the selection
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Complete</h1>
        <p className="text-lg text-muted-foreground">
          We've successfully discovered your node {node?.name} in {organization?.name}. Please review the findings below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Discovery Results</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            The discovery process has completed successfully. Here's what we found:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            </div>
            <div className="flex justify-between">
              <span>Endpoints Found:</span>
              <span className="font-medium">{node?.protocol_details?.endpoints?.length || 3}</span>
            </div>
            <div className="flex justify-between">
              <span>Ports Scanned:</span>
              <span className="font-medium">{node?.protocol_details?.ports?.join(', ') || '8080, 9000, 9001'}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="font-medium">{node?.protocol_details?.display_name || 'Sui'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Next Steps</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm">Discovery completed successfully</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm">Review discovery results</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm">Confirm or modify findings</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              <span className="text-sm text-muted-foreground">Proceed to security scanning</span>
            </div>
          </div>
        </div>
      </div>



      <div className="flex justify-center space-x-4">
        <Button variant="outline" size="lg" onClick={() => setIsProtocolModalOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Edit Discovery
        </Button>
        <Button size="lg" onClick={handleAcceptAndContinue}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Accept & Continue
        </Button>
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