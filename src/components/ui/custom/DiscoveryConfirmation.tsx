import React, { useState } from 'react';
import { CheckCircle, Search, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValidationBanner } from './ValidationBanner';

interface DiscoveryConfirmationProps {
  node: any;
  organization: any;
}

export const DiscoveryConfirmation: React.FC<DiscoveryConfirmationProps> = ({ node, organization }) => {
  const [showValidationBanner, setShowValidationBanner] = useState(true);

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
                  <span className="font-medium">{node?.protocol_details?.endpoints?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ports Scanned:</span>
                  <span className="font-medium">{node?.protocol_details?.ports?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="font-medium">{node?.protocol_details?.display_name}</span>
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

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Discovery Details</h3>
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
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-green-600 mr-3" />
                  <span>Discovery Phase</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-yellow-600 mr-3" />
                  <span>Confirmation Required</span>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Modify Discovery
            </Button>
            <Button size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Discovery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 