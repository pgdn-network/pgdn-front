import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (disputeData: DisputeData) => void;
  scanType: string;
  target: string;
  sessionId?: string;
  scanId?: string;
  isLoading?: boolean;
}

export interface DisputeData {
  scanType: string;
  target: string;
  sessionId?: string;
  scanId?: string;
  userComment: string;
  timestamp: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scanType,
  target,
  sessionId,
  scanId,
  isLoading = false
}) => {
  const [userComment, setUserComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!userComment.trim()) return;

    const disputeData: DisputeData = {
      scanType,
      target,
      sessionId,
      scanId,
      userComment: userComment.trim(),
      timestamp: new Date().toISOString()
    };

    onSubmit(disputeData);
  };

  const handleClose = () => {
    setUserComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dispute Scan Finding
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Scan Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Scan Type:
              </label>
              <Badge variant="outline" className="text-xs font-mono">
                {scanType}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Target:
              </label>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {target}
              </span>
            </div>

            {sessionId && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session ID:
                </label>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {sessionId.substring(0, 8)}...
                </span>
              </div>
            )}
          </div>

          {/* User Comment */}
          <div className="space-y-2">
            <label 
              htmlFor="userComment" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your Comment / Dispute Reason:
            </label>
            <Textarea
              id="userComment"
              placeholder="Explain why you think this result is incorrect..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={4}
              className="w-full resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please provide specific details about what you believe is incorrect.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> This is a beta feature, the humans might intervene to validate your dispute.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!userComment.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </div>
      </div>
    </div>
  );
};
