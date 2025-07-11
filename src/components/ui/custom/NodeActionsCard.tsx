import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListChecks, CheckCircle, AlertTriangle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import type { NodeActionsResponse, NodeAction } from '@/types/node';
import { NodeApiService } from '@/api/nodes';

interface NodeActionsCardProps {
  actionsData: NodeActionsResponse | null;
  organizationUuid?: string;
  nodeId?: string;
}

export const NodeActionsCard: React.FC<NodeActionsCardProps> = ({ 
  actionsData, 
  organizationUuid, 
  nodeId 
}) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [localActions, setLocalActions] = useState<NodeAction[] | null>(actionsData?.actions || null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  if (!actionsData) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Node Actions
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading actions...
        </div>
      </div>
    );
  }

  const actions = localActions ?? actionsData.actions;
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Node Actions
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 py-4">
          No actions found for this node
        </div>
      </div>
    );
  }

  const { open_count, closed_count, muted_count, total } = actionsData;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'muted':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };


  const handleComplete = async (action: NodeAction) => {
    if (!organizationUuid || !nodeId) return;
    setUpdating(action.uuid);
    setActionErrors(prev => ({ ...prev, [action.uuid]: '' }));
    try {
      await NodeApiService.patchNodeAction(
        organizationUuid,
        nodeId,
        action.uuid,
        { status: 'closed' }
      );
      setLocalActions(prev =>
        prev ? prev.map(a => a.uuid === action.uuid ? { ...a, status: 'closed' } : a) : null
      );
      setActionErrors(prev => ({ ...prev, [action.uuid]: '' }));
    } catch {
      setActionErrors(prev => ({ ...prev, [action.uuid]: 'Failed to complete action' }));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Node Actions
          <span className="text-sm font-normal text-muted-foreground">
            {total} total
          </span>
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Open: {open_count}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Closed: {closed_count}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Muted: {muted_count}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {actions.slice(0, 5).map((action) => (
          <div key={action.uuid} className="border-l-4 border-blue-400 pl-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg flex items-start gap-3">
            <div className="pt-1">
              <input
                type="checkbox"
                checked={action.status === 'closed'}
                disabled={action.status === 'closed' || updating === action.uuid}
                onChange={() => handleComplete(action)}
                className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                aria-label="Mark action as complete"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(action.status)}
                <p className="text-sm text-gray-900 dark:text-white font-medium">{action.title}</p>
                {updating === action.uuid && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {action.description}
              </p>
              {actionErrors[action.uuid] && (
                <div className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {actionErrors[action.uuid]}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(action.created_at).toLocaleDateString()}
                {action.last_seen_at && (
                  <span className="ml-4">
                    Last seen: {new Date(action.last_seen_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {actions.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View {actions.length - 5} more actions
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 