import React from 'react';

interface NodeInterventionsProps {
  interventionsData: any;
}

export const NodeInterventions: React.FC<NodeInterventionsProps> = ({ interventionsData }) => {
  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Interventions</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Open: {interventionsData?.open_count || 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              In Progress: {interventionsData?.in_progress_count || 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Resolved: {interventionsData?.resolved_count || 0}
            </span>
          </div>
        </div>
        
        {interventionsData?.interventions && interventionsData.interventions.length > 0 ? (
          <div className="space-y-4">
            {interventionsData.interventions.map((intervention: any) => (
              <div key={intervention.uuid} className="border-l-4 border-yellow-400 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{intervention.reason}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Type: {intervention.related_type}</span>
                      <span>Created: {new Date(intervention.created_at).toLocaleDateString()}</span>
                      {intervention.resolved_at && (
                        <span>Resolved: {new Date(intervention.resolved_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    intervention.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {intervention.status.replace('_', ' ').charAt(0).toUpperCase() + 
                     intervention.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {interventionsData ? 'No interventions found' : 'Loading interventions...'}
          </div>
        )}
      </div>
    </div>
  );
}; 