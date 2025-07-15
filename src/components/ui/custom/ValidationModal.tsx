import React from 'react';
import { X, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Node } from '@/types/node';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Validate Node</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium mb-2">Node Validation Required</h3>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Validation Process:</h4>
            <p className="text-xs text-gray-900 dark:text-white font-normal leading-relaxed">
              Node validation ensures that your target actually belongs to you and is not a malicious actor impersonating your node.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-900 dark:text-white mb-4">
              To proceed with validation, please visit our validation portal:
            </p>
            <Button 
              className="w-full"
              onClick={() => window.open('https://pgdn.network/validation', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Validation Portal
            </Button>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 