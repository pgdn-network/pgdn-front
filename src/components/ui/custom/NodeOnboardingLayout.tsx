import React, { useState, useEffect, useRef } from 'react';
import { NewNodeOnboarding } from '@/components/ui/custom/NewNodeOnboarding';
import { DiscoveryConfirmation } from '@/components/ui/custom/DiscoveryConfirmation';
import { DiscoveryFailure } from '@/components/ui/custom/DiscoveryFailure';
import { NodeOnboardingStepper } from './NodeOnboardingStepper';
import type { OnboardingStep } from './NodeOnboardingStepper';
import { DiscoveryProgressCard } from '@/components/ui/custom/DiscoveryProgressCard';
import { useNodeDiscoverySubscription } from '@/hooks/useWebSocketSubscription';
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
  const discoveryMessage = useNodeDiscoverySubscription(node.uuid);
  const [searchParams] = useSearchParams();
  const [showingProgress, setShowingProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  // Listen for discovery messages and reload when complete
  useEffect(() => {
    // Only process discovery messages if status is pending
    if (node.discovery_status !== 'pending' || !discoveryMessage) {
      return;
    }

    console.log(`🎯 Discovery WebSocket message received for node ${node.uuid}, type: ${discoveryMessage.type}`);
    console.log(`⏰ Starting 10-second reload timer`);
    
    // Hide progress display since we got the result
    setShowingProgress(false);
    
    setTimeout(() => {
      console.log(`🚀 RELOADING PAGE NOW! Message type: ${discoveryMessage.type}`);
      window.location.reload();
    }, 10000); // 10 seconds
    
  }, [discoveryMessage, node.uuid, node.discovery_status]);

  // Auto-start discovery for new nodes and show progress
  useEffect(() => {
    if (node.simple_state === 'new' && node.discovery_status === 'pending' && !showingProgress) {
      console.log(`🚀 Starting discovery progress display for new node ${node.uuid}`);
      setShowingProgress(true);
    }
  }, [node.simple_state, node.discovery_status, showingProgress]);

  // Animate progress bar when showing progress
  useEffect(() => {
    if (!showingProgress) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Gradually increase progress, slowing down as it approaches 90%
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 1;
        if (prev < 85) return prev + 0.5;
        if (prev < 90) return prev + 0.2;
        return prev; // Stop at 90% until we get actual result
      });
    }, 200); // Update every 200ms

    return () => clearInterval(interval);
  }, [showingProgress]);

  // Fallback refresh after 30 seconds in case WebSocket doesn't fire
  useEffect(() => {
    if (!showingProgress) {
      return;
    }

    console.log(`⏰ Setting 30-second fallback refresh timer for node ${node.uuid}`);
    
    const fallbackTimeout = setTimeout(() => {
      console.log(`🔄 30-second fallback triggered - refreshing page for node ${node.uuid}`);
      window.location.reload();
    }, 30000); // 30 seconds

    return () => {
      console.log(`🚫 Clearing 30-second fallback timer for node ${node.uuid}`);
      clearTimeout(fallbackTimeout);
    };
  }, [showingProgress, node.uuid]);

  // Check for test discovery state from query params
  const discoveryState = searchParams.get('discovery');
  
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
  
  // Show appropriate UI based on actual node status
  if (node.discovery_status === 'failed') {
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
  
  if (node.discovery_status === 'completed') {
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
  
  // For pending nodes, show progress if discovery is happening, otherwise show onboarding
  if (node.discovery_status === 'pending') {
    if (showingProgress) {
      return (
        <div className="min-h-screen bg-background">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <NodeOnboardingStepper currentStep="discover" />
              <div className="mt-6">
                <DiscoveryProgressCard
                  nodeName={node.name}
                  progress={progress}
                  discoveryResult={null}
                  isRunning={true}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
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
    }
  }

  // Default fallback
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