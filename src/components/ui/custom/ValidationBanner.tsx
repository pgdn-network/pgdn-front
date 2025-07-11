import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationBannerProps {
  node: any;
  onClose: () => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({ node }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Validation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Validate Node</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Node validation ensures that the target is reachable and properly configured for scanning.
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-sm mb-2">Validation Process:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>To validate your node, run a single <code>curl</code> command from your node. This proves you own the IP address.</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement validation logic
                    console.log('Validating node:', node.uuid);
                    setIsModalOpen(false);
                  }}
                >
                  Start Validation
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 