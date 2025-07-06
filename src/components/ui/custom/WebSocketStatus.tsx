import React from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Badge } from '@/components/ui/badge';

export const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionState, error } = useWebSocketContext();

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
      case 'closed':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
      case 'closed':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'disconnected':
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex items-center space-x-2" title={`WebSocket Status: ${connectionState}${error ? ` - Error: ${error.message}` : ''}`}>
      {getStatusIcon()}
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusText()}
      </Badge>
    </div>
  );
}; 