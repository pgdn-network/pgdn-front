import React from 'react';
import { Search, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DiscoveryProgressProps {
  isActive: boolean;
  currentStep?: number;
  totalSteps?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  className?: string;
}

export const DiscoveryProgress: React.FC<DiscoveryProgressProps> = ({
  isActive,
  currentStep = 0,
  totalSteps = 4,
  status = 'pending',
  className = ''
}) => {
  if (!isActive) return null;

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Discovery Complete';
      case 'in_progress':
        return `Discovery in Progress (${Math.round(progress)}%)`;
      case 'failed':
        return 'Discovery Failed';
      default:
        return 'Discovery Pending';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {status === 'in_progress' && (
        <div className="w-24 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}; 