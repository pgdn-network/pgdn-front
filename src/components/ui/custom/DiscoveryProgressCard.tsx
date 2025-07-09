import React from 'react';
import { Search, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface DiscoveryStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
}

interface DiscoveryProgressCardProps {
  nodeName: string;
  progress: number;
  discoveryResult: 'success' | 'failed' | null;
  isRunning: boolean;
}

export const DiscoveryProgressCard: React.FC<DiscoveryProgressCardProps> = ({
  nodeName,
  progress,
  discoveryResult,
  isRunning,
}) => {
  // No state or effects, just render UI based on props
  return (
    <div className="bg-white dark:bg-gray-800 shadow p-6">
      <div className="text-center mb-6">
        <div className="bg-blue-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Search className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Discovery in Progress</h3>
        <p className="text-muted-foreground">
          Analyzing {nodeName} to identify services and configurations
        </p>
      </div>
      {/* Single Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {/* Discovery Information */}
      <div className={`p-4 border ${
        discoveryResult === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : discoveryResult === 'failed'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      }`}>
        <div className="flex items-start space-x-3">
          {discoveryResult === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : discoveryResult === 'failed' ? (
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          ) : (
            <Search className="h-5 w-5 text-blue-600 mt-0.5" />
          )}
          <div>
            <h4 className={`text-sm font-medium mb-1 ${
              discoveryResult === 'success'
                ? 'text-green-900 dark:text-green-100'
                : discoveryResult === 'failed'
                ? 'text-red-900 dark:text-red-100'
                : 'text-blue-900 dark:text-blue-100'
            }`}>
              {discoveryResult === 'success'
                ? 'Discovery Completed Successfully'
                : discoveryResult === 'failed'
                ? 'Discovery Failed'
                : 'Discovery in Progress'}
            </h4>
            <p className={`text-sm ${
              discoveryResult === 'success'
                ? 'text-green-800 dark:text-green-200'
                : discoveryResult === 'failed'
                ? 'text-red-800 dark:text-red-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {discoveryResult === 'success'
                ? 'Your node has been successfully discovered. The page will refresh shortly to show the results.'
                : discoveryResult === 'failed'
                ? 'Discovery failed. The page will refresh shortly to show error details and manual configuration options.'
                : 'We\'re analyzing your node to identify network connectivity, open ports, and running services. This process typically takes a few seconds and will automatically detect your blockchain protocol.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 