import React, { useState, useEffect } from 'react';
import { Rocket, Search, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import type { Node as ApiNode } from '@/types/node';

interface Node extends ApiNode {
  simple_status?: string;
}

interface Organization {
  name: string;
  slug: string;
}

interface NewNodeOnboardingProps {
  node: Node;
  organization: Organization;
}

export const NewNodeOnboarding: React.FC<NewNodeOnboardingProps> = ({ node, organization }) => {
  const { lastMessage } = useWebSocketContext();

  // Listen for WebSocket discovery progress messages
  useEffect(() => {
    if (lastMessage?.type === 'discovery_progress' && lastMessage.payload?.node_id === node.uuid) {
      const { progress } = lastMessage.payload;
      
      if (progress >= 100) {
        // Discovery completed - this will be handled by the parent component
        console.log('Discovery completed via WebSocket');
      }
    }
  }, [lastMessage, node.uuid]);

  const handleDiscoveryComplete = (success: boolean) => {
    // In a real implementation, you would update the node status here
    console.log('Discovery completed:', success);
  };

  const isFirstState = node.simple_state === 'new' && node.discovery_status === 'pending';

  if (!isFirstState) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Node Onboarding</h2>
        <p className="text-muted-foreground">
          This node is not in the initial onboarding state.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome to Node Onboarding</h1>
        <p className="text-base text-muted-foreground">
          Let's get your node {node?.name} set up and ready for scanning
        </p>
      </div>

      {/* Discovery Information Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Info className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium mb-2">What is Discovery?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discovery is the first step in onboarding your node. It analyzes your target to identify:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Network connectivity and reachability
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Open ports and running services
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                Protocol configurations and versions
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Node Information Card */}
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
              <span className="text-xs text-muted-foreground">Protocol:</span>
              <span className="text-xs">{node?.protocol_details?.display_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Status:</span>
              <span className="text-xs">{node?.simple_state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-base font-medium mb-2">Discovery Will Start Automatically</h3>
          <p className="text-sm text-muted-foreground">
            Your node has been created successfully. Discovery will begin automatically to analyze your node and prepare it for scanning.
          </p>
        </div>
      </div>
    </>
  );
}; 