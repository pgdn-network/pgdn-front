import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Server, Activity } from 'lucide-react';
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

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Node Snapshot
        </h2>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(snapshot.operational_status)}`}>
          {(snapshot.operational_status ? snapshot.operational_status.charAt(0).toUpperCase() + snapshot.operational_status.slice(1) : 'Unknown')}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Server className="h-4 w-4 mr-1" />
              Status Message:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">{snapshot.status_message || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last Scan:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {snapshot.latest_scan_date ? new Date(snapshot.latest_scan_date).toLocaleDateString() : 'N/A'}
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
              <span className="text-sm text-gray-900 dark:text-white">{snapshot.scan_completeness_rate}%</span>
            </div>
          )}
          
          {snapshot.latest_score !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Latest Score:</span>
              <span className="text-sm text-gray-900 dark:text-white">{snapshot.latest_score}</span>
            </div>
          )}
        </div>
        
        {/* Right Column */}
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
            <span className="text-sm text-gray-500 dark:text-gray-400">Open Ports:</span>
            <span className="text-sm text-gray-900 dark:text-white">{snapshot.total_open_ports || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Web Server:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              snapshot.web_server_detected === true
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {snapshot.web_server_detected === true ? 'Detected' : 'Not Detected'}
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
      
      {/* Location Information */}
      {(snapshot.geo_city || snapshot.geo_country) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            {[snapshot.geo_city, snapshot.geo_country].filter(Boolean).join(', ')}
          </div>
        </div>
      )}
      
      {/* Tasks and Interventions Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Active Tasks: </span>
            <span className="text-gray-900 dark:text-white">{snapshot.active_tasks_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Failed Tasks: </span>
            <span className="text-gray-900 dark:text-white">{snapshot.failed_tasks_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Open Interventions: </span>
            <span className="text-gray-900 dark:text-white">{snapshot.open_interventions_count || 0}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Critical Interventions: </span>
            <span className="text-gray-900 dark:text-white">{snapshot.critical_interventions_count || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Last Activity */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
          <span className="text-gray-900 dark:text-white">
            {snapshot.last_activity ? new Date(snapshot.last_activity).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}; 