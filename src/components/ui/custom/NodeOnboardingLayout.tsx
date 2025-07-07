import React, { useState, useEffect } from 'react';
import { NewNodeOnboarding } from '@/components/ui/custom/NewNodeOnboarding';
import { DiscoveryConfirmation } from '@/components/ui/custom/DiscoveryConfirmation';
import { DiscoveryFailure } from '@/components/ui/custom/DiscoveryFailure';
import { NodeOnboardingStepper } from './NodeOnboardingStepper';
import type { OnboardingStep } from './NodeOnboardingStepper';
import { DiscoveryProgress } from '@/components/ui/custom/DiscoveryProgress';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useSearchParams } from 'react-router-dom';
import type { Node as ApiNode } from '@/types/node';

interface Node extends ApiNode {
  simple_status?: string;
}

interface Organization {
  name: string;
  slug: string;
}

interface NodeOnboardingLayoutProps {
  node: Node;
  organization: Organization;
}

function getCurrentStep(node: Node): OnboardingStep {
  if (node.discovery_status === 'completed' && node.validated) return 'scan';
  if (node.discovery_status === 'completed') return 'validate';
  if (node.discovery_status === 'pending' || node.discovery_status === 'failed') return 'discover';
  return 'add';
}

export const NodeOnboardingLayout: React.FC<NodeOnboardingLayoutProps> = ({ 
  node, 
  organization 
}) => {
  const [discoveryStatus, setDiscoveryStatus] = useState<'pending' | 'in_progress' | 'completed' | 'failed'>('pending');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(4);

  const { lastMessage } = useWebSocketContext();
  const [searchParams] = useSearchParams();

  // Check for test discovery state from query params
  const discoveryState = searchParams.get('discovery');

  // Listen for WebSocket discovery progress messages
  useEffect(() => {
    if (lastMessage?.type === 'discovery_progress' && lastMessage.payload?.node_id === node.uuid) {
      const { progress, status } = lastMessage.payload;
      
      if (status === 'completed') {
        setCurrentStep(Math.round((progress / 100) * totalSteps));
      }
      
      if (progress >= 100) {
        setDiscoveryStatus('completed');
      }
    }
  }, [lastMessage, node.uuid, totalSteps]);

  // Determine discovery status from node state
  useEffect(() => {
    if (node.discovery_status === 'completed') {
      setDiscoveryStatus('completed');
    } else if (node.discovery_status === 'failed') {
      setDiscoveryStatus('failed');
    } else if (node.discovery_status === 'pending') {
      setDiscoveryStatus('pending');
    }
  }, [node.discovery_status]);

  // Stepper logic
  const stepperStep = getCurrentStep(node);

  // Handle test discovery states from query params
  if (discoveryState === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <NodeOnboardingStepper currentStep="validate" />
            <div className="mt-6">
              <DiscoveryConfirmation node={node} organization={organization} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (discoveryState === 'failed') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <NodeOnboardingStepper currentStep="discover" />
            <div className="mt-6">
              <DiscoveryFailure node={node} organization={organization} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine which onboarding component to show based on discovery status
  if (node.simple_state === 'new' && node.discovery_status === 'completed') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <NodeOnboardingStepper currentStep={stepperStep} />
            <div className="mt-6">
              <DiscoveryConfirmation node={node} organization={organization} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // For all other cases (new nodes with pending/failed discovery, or any other state)
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <NodeOnboardingStepper currentStep={stepperStep} />
          <div className="mt-6">
            <NewNodeOnboarding node={node} organization={organization} />
          </div>
        </div>
      </div>
    </div>
  );
}; 