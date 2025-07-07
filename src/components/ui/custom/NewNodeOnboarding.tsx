import React, { useState } from 'react';
import { Rocket, CheckCircle, Search, Activity, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValidationBanner } from './ValidationBanner';

interface NewNodeOnboardingProps {
  node: any;
  organization: any;
}

export const NewNodeOnboarding: React.FC<NewNodeOnboardingProps> = ({ node, organization }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

  const isDiscoveryPending = node.discovery_status === 'pending';
  const isDiscoveryFailed = node.discovery_status !== 'completed' && node.discovery_status !== 'pending';

  return (
    <div className="min-h-screen bg-background">
      {/* Validation Banner - Full Width */}
      {!node.validated && showValidationBanner && (
        <ValidationBanner 
          node={node} 
          onClose={() => setShowValidationBanner(false)} 
        />
      )}
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Node Onboarding</h2>
            <p className="text-lg text-muted-foreground">
              Let's get your node {node?.name} set up and ready for scanning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Node Created</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your node has been successfully created and is ready for the onboarding process.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{node?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-medium">{node?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-medium">{node?.protocol_details?.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="font-medium">{node?.simple_state}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Search className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isDiscoveryPending ? 'bg-blue-100 text-blue-800' : 
                    isDiscoveryFailed ? 'bg-red-100 text-red-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {node?.discovery_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Validated:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    node?.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {node?.validated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ready for Scan:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    node?.is_ready_for_scan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {node?.is_ready_for_scan ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery Status Specific Content */}
          {isDiscoveryPending && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery in Progress</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                We're currently discovering and analyzing your node. This process may take a few minutes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Network connectivity established</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm">Port scanning in progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Service identification</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Vulnerability assessment</span>
                </div>
              </div>
            </div>
          )}

          {isDiscoveryFailed && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Discovery Failed</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                The discovery process encountered an error. Please check your node configuration and try again.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-red-600">Discovery process failed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Check network connectivity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Verify protocol configuration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm text-muted-foreground">Review firewall settings</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="mr-3">
                  Retry Discovery
                </Button>
                <Button variant="outline">
                  View Logs
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Onboarding Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Node Registration</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isDiscoveryPending ? 'bg-blue-50' : isDiscoveryFailed ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center">
                  <Search className={`h-5 w-5 mr-3 ${
                    isDiscoveryPending ? 'text-blue-600' : isDiscoveryFailed ? 'text-red-600' : 'text-green-600'
                  }`} />
                  <span>Discovery Phase</span>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  isDiscoveryPending ? 'bg-blue-100 text-blue-800' : 
                  isDiscoveryFailed ? 'bg-red-100 text-red-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {isDiscoveryPending ? 'In Progress' : isDiscoveryFailed ? 'Failed' : 'Completed'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <span>Security Assessment</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 