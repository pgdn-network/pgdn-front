import React from 'react';
import { Clock, Server, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { NodeSnapshot } from '@/types/node';

interface NodeSnapshotCardProps {
  snapshot: NodeSnapshot | null;
  loading?: boolean;
}

export const NodeSnapshotCard: React.FC<NodeSnapshotCardProps> = ({ snapshot, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Node Snapshot</h2>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Snapshot</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No snapshot data available
        </div>
      </div>
    );
  }

  const getScanStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreGrade = (score: number | null): { grade: string; color: string } => {
    if (score === null) return { grade: 'N/A', color: 'bg-gray-100 text-gray-800' };
    
    if (score >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    if (score >= 80) return { grade: 'B', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' };
    if (score >= 65) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    if (score >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
    return { grade: 'F', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Node Snapshot
        </h2>
        {snapshot.latest_score !== null && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Security Grade:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full cursor-help ${getScoreGrade(snapshot.latest_score).color}`}>
                    {getScoreGrade(snapshot.latest_score).grade}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Security Score: {snapshot.latest_score}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Scan Information */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last Scan:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {snapshot.latest_scan_date ? new Date(snapshot.latest_scan_date).toLocaleString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Scan Status:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getScanStatusColor(snapshot.scan_status)}`}>
              {(snapshot.scan_status ? snapshot.scan_status.charAt(0).toUpperCase() + snapshot.scan_status.slice(1) : 'Unknown')}
            </span>
          </div>
          
          {snapshot.scan_completeness_rate !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Scan Completeness:</span>
              <span className="text-sm text-gray-900 dark:text-white">{Math.round(snapshot.scan_completeness_rate * 100)}%</span>
            </div>
          )}

          {snapshot.detected_protocols && snapshot.detected_protocols.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Detected Protocols:</span>
              <div className="flex flex-wrap gap-1">
                {snapshot.detected_protocols.map((protocol: string) => (
                  <span
                    key={protocol}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                  >
                    {protocol.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Analysis Level:</span>
            <span className="text-sm text-gray-900 dark:text-white capitalize">
              {snapshot.analysis_level || '—'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Discovery Method:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {snapshot.discovery_method?.replace('_', ' ') || '—'}
            </span>
          </div>
        </div>
        
        {/* Right Column - Security & Capabilities */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Server className="h-4 w-4 mr-1" />
              Total CVEs:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">{snapshot.total_cves || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Critical CVEs:</span>
            <span className="text-sm text-red-600 dark:text-red-400">{snapshot.critical_severity_cves || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">High CVEs:</span>
            <span className="text-sm text-orange-600 dark:text-orange-400">{snapshot.high_severity_cves || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">RPC Available:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              snapshot.rpc_available === true
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {snapshot.rpc_available === true ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">gRPC Available:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              snapshot.grpc_available === true
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {snapshot.grpc_available === true ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Docker Services:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              snapshot.docker_services_detected === true
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {snapshot.docker_services_detected === true ? 'Detected' : 'Not Detected'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">SSL Issues:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              snapshot.has_ssl_issues === true
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {snapshot.has_ssl_issues === true ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Open Ports List */}
      {snapshot.open_ports && snapshot.open_ports.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Open Ports:</h3>
          <div className="flex flex-wrap gap-2">
            {snapshot.open_ports.map((port) => (
              <span
                key={port}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
              >
                {port}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Endpoints Section */}
      {(snapshot.primary_rpc_endpoint || snapshot.primary_grpc_endpoint) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Endpoints:</h3>
          <div className="space-y-2">
            {snapshot.primary_rpc_endpoint && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Primary RPC:</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {snapshot.primary_rpc_endpoint}
                </code>
              </div>
            )}
            {snapshot.primary_grpc_endpoint && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Primary gRPC:</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {snapshot.primary_grpc_endpoint}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}; 