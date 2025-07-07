import React from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Send } from 'lucide-react';

export const WebSocketExample: React.FC = () => {
  const { isConnected, connectionState, send } = useWebSocketContext();

  const handleSendTestMessage = () => {
    send({
      type: 'test_message',
      payload: {
        message: 'Hello from frontend!',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">WebSocket Status</h3>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">Status: {connectionState}</span>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Test Message Button */}
        <div>
          <Button 
            onClick={handleSendTestMessage}
            disabled={!isConnected}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Test Message
          </Button>
        </div>

        {/* Message Format Info */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Supported Message Types:</p>
          <ul className="space-y-1">
            <li>• <code>scan_started</code> - When a scan begins</li>
            <li>• <code>scan_progress</code> - Scan progress updates</li>
            <li>• <code>scan_completed</code> - When a scan finishes</li>
            <li>• <code>scan_failed</code> - When a scan fails</li>
            <li>• <code>notification</code> - General notifications</li>
            <li>• <code>pong</code> - Heartbeat responses</li>
          </ul>
        </div>

        {/* Message Format */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Message Format:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "type": "scan_started",
  "payload": {
    "node_id": "123",
    "scan_type": "web"
  },
  "timestamp": "2025-07-06T13:00:00Z"
}`}
          </pre>
        </div>
      </div>
    </Card>
  );
}; 