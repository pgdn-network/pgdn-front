import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Node {
  uuid: string;
  name: string;
}

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node;
  onDiscoveryComplete: (success: boolean) => void;
}

interface DiscoveryStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  isOpen,
  onClose,
  node,
  onDiscoveryComplete
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isDiscoveryRunning, setIsDiscoveryRunning] = useState(false);
  const [steps, setSteps] = useState<DiscoveryStep[]>([
    {
      id: 'connectivity',
      name: 'Network Connectivity',
      status: 'pending',
      description: 'Testing network connectivity to the target'
    },
    {
      id: 'port_scan',
      name: 'Port Scanning',
      status: 'pending',
      description: 'Scanning for open ports and services'
    },
    {
      id: 'service_identification',
      name: 'Service Identification',
      status: 'pending',
      description: 'Identifying running services and protocols'
    },
    {
      id: 'vulnerability_assessment',
      name: 'Vulnerability Assessment',
      status: 'pending',
      description: 'Assessing potential security vulnerabilities'
    }
  ]);

  const { send } = useWebSocketContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for test state from query params
  const testState = searchParams.get('state');

  const startDiscovery = async () => {
    setIsStarting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsStarting(false);
    setIsDiscoveryRunning(true);
    
    // If test state is specified, use it; otherwise simulate normal process
    if (testState === 'failed') {
      simulateFailedDiscovery();
    } else {
      simulateDiscoveryProcess();
    }
  };

  const simulateDiscoveryProcess = async () => {
    for (let i = 0; i < steps.length; i++) {
      // Update step status to in progress
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'in_progress' } : step
      ));
      
      // Simulate step duration (2-4 seconds)
      const duration = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Update step status to completed
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed' } : step
      ));
      
      // Send WebSocket message for progress
      send({
        type: 'discovery_progress',
        payload: {
          node_id: node.uuid,
          step: steps[i].id,
          progress: ((i + 1) / steps.length) * 100,
          status: 'completed'
        }
      });
    }
    
    // Discovery completed successfully
    setIsDiscoveryRunning(false);
    onDiscoveryComplete(true);
    onClose();
    
    // Redirect to success page
    navigate(`/organizations/test/nodes/${node.uuid}?discovery=success`);
  };

  const simulateFailedDiscovery = async () => {
    // Simulate failed discovery
    setSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'completed' } : 
      index === 1 ? { ...step, status: 'in_progress' } : step
    ));
    
    // Wait 3 seconds then fail
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSteps(prev => prev.map((step, index) => 
      index === 1 ? { ...step, status: 'failed' } : step
    ));
    
    setIsDiscoveryRunning(false);
    onDiscoveryComplete(false);
    onClose();
    
    // Redirect to failure page
    navigate(`/organizations/test/nodes/${node.uuid}?discovery=failed`);
  };

  const forceFailedDiscovery = async () => {
    setIsStarting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsStarting(false);
    setIsDiscoveryRunning(true);
    
    // Simulate failed discovery
    setSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'completed' } : 
      index === 1 ? { ...step, status: 'in_progress' } : step
    ));
    
    // Wait 3 seconds then fail
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setSteps(prev => prev.map((step, index) => 
      index === 1 ? { ...step, status: 'failed' } : step
    ));
    
    setIsDiscoveryRunning(false);
    onDiscoveryComplete(false);
    onClose();
    
    // Redirect to failure page
    navigate(`/organizations/test/nodes/${node.uuid}?discovery=failed`);
  };

  const getStepIcon = (step: DiscoveryStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Start Discovery</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            disabled={isDiscoveryRunning}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Discovery will analyze your node {node?.name} to identify services, ports, and potential vulnerabilities.
          </p>
          
          {isDiscoveryRunning && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Discovery Progress:</h4>
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isDiscoveryRunning && (
            <div className="flex space-x-3">
              <Button 
                className="flex-1"
                onClick={startDiscovery}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Discovery
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={forceFailedDiscovery}
                disabled={isStarting}
              >
                Force Fail
              </Button>
            </div>
          )}
          
          {!isDiscoveryRunning && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 