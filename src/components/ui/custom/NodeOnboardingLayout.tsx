import React from 'react';
import { NewNodeOnboarding } from '@/components/ui/custom/NewNodeOnboarding';
import { DiscoveryConfirmation } from '@/components/ui/custom/DiscoveryConfirmation';

interface NodeOnboardingLayoutProps {
  node: any;
  organization: any;
}

export const NodeOnboardingLayout: React.FC<NodeOnboardingLayoutProps> = ({ 
  node, 
  organization 
}) => {
  // Determine which onboarding component to show based on discovery status
  if (node.simple_state === 'new' && node.discovery_status === 'completed') {
    return <DiscoveryConfirmation node={node} organization={organization} />;
  }
  
  // For all other cases (new nodes with pending/failed discovery, or any other state)
  return <NewNodeOnboarding node={node} organization={organization} />;
}; 