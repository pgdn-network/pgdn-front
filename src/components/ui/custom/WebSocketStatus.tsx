import React from 'react';
import { Circle } from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

export const WebSocketStatus: React.FC = () => {
  const { connectionState, error } = useWebSocketContext();

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-orange-500';
      case 'disconnected':
      case 'closed':
      default:
        return 'text-red-500';
    }
  };

  const getTooltipText = () => {
    switch (connectionState) {
      case 'connected':
        return 'WebSocket: Connected';
      case 'connecting':
        return 'WebSocket: Connecting...';
      case 'disconnected':
      case 'closed':
        return 'WebSocket: Disconnected';
      default:
        return 'WebSocket: Unknown status';
    }
  };

  return (
    <div 
      className="flex items-center" 
      title={`${getTooltipText()}${error ? ` - Error: ${error.message}` : ''}`}
    >
      <Circle className={`h-3 w-3 fill-current ${getStatusColor()}`} />
    </div>
  );
}; 