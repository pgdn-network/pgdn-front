import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ScanProgressBarProps {
  scanType: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  target?: string;
  createdAt: string;
}

export const ScanProgressBar: React.FC<ScanProgressBarProps> = ({
  scanType,
  status,
  progress = 0,
  target,
  createdAt
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-200';
      case 'running':
        return 'bg-blue-200';
      case 'completed':
        return 'bg-green-200';
      case 'failed':
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const displayProgress = status === 'completed' ? 100 : (status === 'failed' ? 100 : progress);

  return (
    <div className="border p-3 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {scanType.charAt(0).toUpperCase() + scanType.slice(1)} Scan
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()} text-gray-800`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(createdAt).toLocaleTimeString()}
        </span>
      </div>
      
      {target && (
        <div className="mb-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Target: {target}</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
        <div 
          className={`h-2 transition-all duration-300 ${getProgressBarColor()}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {status === 'running' ? `${Math.round(progress)}% complete` : 
           status === 'completed' ? 'Completed' :
           status === 'failed' ? 'Failed' : 'Queued'}
        </span>
        {status === 'running' && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};