import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Settings, Radio, AlertTriangle, Microscope, Database, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SuiScanResultProps {
  scan: any;
}

const formatTimestamp = (timestamp: string | number | null): string => {
  if (!timestamp) return 'N/A';
  try {
    let date: Date;
    if (typeof timestamp === 'number') {
      // Handle Unix timestamps - check if it's in seconds or milliseconds
      const now = Date.now();
      const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
      // Sanity check: don't show dates before 2000 or more than 1 year in the future
      if (timestampMs < 946684800000 || timestampMs > now + 365 * 24 * 60 * 60 * 1000) {
        return 'Invalid date';
      }
      date = new Date(timestampMs);
    } else {
      date = new Date(timestamp);
      // Check if the parsed date is valid and not in 1970
      if (date.getTime() < 946684800000) {
        return 'Invalid date';
      }
    }
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

const formatNumber = (num: number | string | null): string => {
  if (num === null || num === undefined) return 'N/A';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return String(num);
  
  // Format large numbers with appropriate suffixes
  if (numValue >= 1e12) {
    return (numValue / 1e12).toFixed(2) + 'T';
  } else if (numValue >= 1e9) {
    return (numValue / 1e9).toFixed(2) + 'B';
  } else if (numValue >= 1e6) {
    return (numValue / 1e6).toFixed(2) + 'M';
  } else if (numValue >= 1e3) {
    return (numValue / 1e3).toFixed(2) + 'K';
  }
  return numValue.toLocaleString();
};

const formatSuiAmount = (mistAmount: number | string | null): string => {
  if (mistAmount === null || mistAmount === undefined) return 'N/A';
  const mistValue = typeof mistAmount === 'string' ? parseFloat(mistAmount) : mistAmount;
  if (isNaN(mistValue)) return String(mistAmount);
  
  // Convert MIST to SUI (1 SUI = 10^9 MIST)
  const suiValue = mistValue / 1e9;
  
  // Format with appropriate precision and suffixes
  if (suiValue >= 1e12) {
    return (suiValue / 1e12).toFixed(2) + 'T SUI';
  } else if (suiValue >= 1e9) {
    return (suiValue / 1e9).toFixed(2) + 'B SUI';
  } else if (suiValue >= 1e6) {
    return (suiValue / 1e6).toFixed(2) + 'M SUI';
  } else if (suiValue >= 1e3) {
    return (suiValue / 1e3).toFixed(2) + 'K SUI';
  } else if (suiValue >= 1) {
    return suiValue.toFixed(2) + ' SUI';
  } else {
    return suiValue.toFixed(6) + ' SUI';
  }
};

const getHealthStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'healthy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'unhealthy':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
};

const RpcMethodsList: React.FC<{ methods: string[] }> = ({ methods }) => {
  const [showAll, setShowAll] = useState(false);
  const displayMethods = showAll ? methods : methods.slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {displayMethods.map((method, index) => (
          <Badge key={index} variant="secondary" className="text-xs font-mono">
            {method}
          </Badge>
        ))}
      </div>
      {methods.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs"
        >
          {showAll ? 'Show less' : `Show ${methods.length - 5} more`}
        </Button>
      )}
    </div>
  );
};

export const SuiScanResult: React.FC<SuiScanResultProps> = ({ scan }) => {
  if (!scan?.scan_results?.pgdn_result?.data?.[0]?.payload) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>No Sui scan data available</p>
      </div>
    );
  }

  const payload = scan.scan_results.pgdn_result.data[0].payload;
  const meta = scan.scan_results.pgdn_result.meta || {};

  return (
    <div className="space-y-4">
      {/* Node Summary */}
      <SectionCard
        title="Node Summary"
        icon={<Brain className="h-5 w-5 text-blue-600" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
              <span className="font-mono">{payload.ip || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Port:</span>
              <span className="font-mono">{payload.port || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Node Type:</span>
              <Badge variant="outline">{payload.node_type || 'N/A'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Network:</span>
              <Badge className={payload.network === 'mainnet' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {payload.network || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Protocol Version:</span>
              <span className="font-mono">{payload.protocol_version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Epoch:</span>
              <span className="font-mono">{payload.current_epoch || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
              <span className="font-mono">{formatNumber(payload.total_transactions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reference Gas Price:</span>
              <span className="font-mono">{payload.reference_gas_price || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">RPC Exposed:</span>
              <Badge className={payload.rpc_exposed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {payload.rpc_exposed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">TLS Enabled:</span>
              <Badge className={payload.tls_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {payload.tls_enabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">CORS Enabled:</span>
              <Badge className={payload.cors_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {payload.cors_enabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Node Classification:</span>
              <Badge variant="outline">{payload.node_classification || 'N/A'}</Badge>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* System State */}
      {payload.system_state && (
        <SectionCard
          title="System State"
          icon={<Database className="h-5 w-5 text-green-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Epoch:</span>
                <span className="font-mono">{payload.system_state.epoch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Protocol Version:</span>
                <span className="font-mono">{payload.system_state.protocolVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Safe Mode:</span>
                <Badge className={payload.system_state.safeMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                  {payload.system_state.safeMode ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Stake:</span>
                <span className="font-mono">{formatSuiAmount(payload.system_state.totalStake)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max Validators:</span>
                <span className="font-mono">{payload.system_state.maxValidatorCount}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage Fund Rebates:</span>
                <span className="font-mono text-sm">{formatSuiAmount(payload.system_state.storageFundTotalObjectStorageRebates)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Non-Refundable Balance:</span>
                <span className="font-mono text-sm">{formatSuiAmount(payload.system_state.storageFundNonRefundableBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Stake Subsidy Balance:</span>
                <span className="font-mono text-sm">{formatSuiAmount(payload.system_state.stakeSubsidyBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Min Validator Stake:</span>
                <span className="font-mono text-sm">{formatSuiAmount(payload.system_state.minValidatorJoiningStake)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Epoch Duration:</span>
                <span className="font-mono">{payload.system_state.epochDurationMs ? `${Number(payload.system_state.epochDurationMs) / 1000}s` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Protocol Config */}
      {payload.metrics_snapshot?.protocol_config && (
        <SectionCard
          title="Protocol Config"
          icon={<Settings className="h-5 w-5 text-purple-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Version:</span>
                <span className="font-mono">{payload.metrics_snapshot.protocol_config.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Min Supported:</span>
                <span className="font-mono">{payload.metrics_snapshot.protocol_config.min_supported}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max Supported:</span>
                <span className="font-mono">{payload.metrics_snapshot.protocol_config.max_supported}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max TX Size:</span>
                <span className="font-mono">{formatNumber(payload.metrics_snapshot.protocol_config.max_tx_size)} bytes</span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* RPC & Interfaces */}
      <SectionCard
        title="RPC & Interfaces"
        icon={<Radio className="h-5 w-5 text-cyan-600" />}
      >
        <div className="space-y-6">
          {/* Interface Availability */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-sm font-medium ${payload.websocket_available ? 'text-green-600' : 'text-red-600'}`}>
                WebSocket
              </div>
              <div className="text-xs text-gray-500">{payload.websocket_available ? 'Available' : 'Unavailable'}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-sm font-medium ${payload.graphql_available ? 'text-green-600' : 'text-red-600'}`}>
                GraphQL
              </div>
              <div className="text-xs text-gray-500">{payload.graphql_available ? 'Available' : 'Unavailable'}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-sm font-medium ${payload.grpc_available ? 'text-green-600' : 'text-red-600'}`}>
                gRPC
              </div>
              <div className="text-xs text-gray-500">{payload.grpc_available ? 'Available' : 'Unavailable'}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-blue-600">
                {payload.rpc_extraction?.success_rate ? `${(payload.rpc_extraction.success_rate * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">RPC Success Rate</div>
            </div>
          </div>

          {/* RPC Discovery Info */}
          {payload.rpc_discovery && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">RPC Discovery</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">API Version:</span>
                  <span className="font-mono">{payload.rpc_discovery.api_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">OpenRPC Version:</span>
                  <span className="font-mono">{payload.rpc_discovery.openrpc_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Methods:</span>
                  <span className="font-mono">{payload.rpc_discovery.total_methods}</span>
                </div>
              </div>
            </div>
          )}

          {/* Available RPC Methods */}
          {payload.rpc_methods_available && payload.rpc_methods_available.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Available RPC Methods ({payload.rpc_methods_available.length})
              </h4>
              <RpcMethodsList methods={payload.rpc_methods_available} />
            </div>
          )}

          {/* Sui Client Extractions */}
          {payload.sui_client_extractions && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sui Client Extractions:</span>
              <span className="font-mono">{payload.sui_client_extractions}</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Node Health */}
      {payload.node_health && (
        <SectionCard
          title="Node Health"
          icon={<Activity className="h-5 w-5 text-red-500" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className={getHealthStatusColor(payload.node_health.status)}>
                    {payload.node_health.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Score:</span>
                  <span className="font-mono text-lg font-semibold">
                    {payload.node_health.score ? `${(payload.node_health.score * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Assessment Time:</span>
                  <span className="font-mono text-sm">{formatTimestamp(payload.node_health.assessment_timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Health Issues */}
            {payload.node_health.issues && payload.node_health.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Health Issues
                </h4>
                <div className="flex flex-wrap gap-2">
                  {payload.node_health.issues.map((issue: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {issue.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Extraction Errors */}
            {payload.extraction_errors && payload.extraction_errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Extraction Errors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {payload.extraction_errors.map((error: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {error.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Scan Meta */}
      <SectionCard
        title="Scan Metadata"
        icon={<Microscope className="h-5 w-5 text-gray-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scanner Version:</span>
              <span className="font-mono text-sm">{meta.scanner_version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan Level:</span>
              <Badge variant="outline">{meta.scan_level || scan.scan_level || 'N/A'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tools Used:</span>
              <div className="flex flex-wrap gap-1">
                {meta.tools_used?.map((tool: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                )) || <span className="text-gray-500">N/A</span>}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan Start:</span>
              <span className="font-mono text-sm">{formatTimestamp(scan.started_at || (meta.scan_start ? meta.scan_start * 1000 : null))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan End:</span>
              <span className="font-mono text-sm">{formatTimestamp(scan.completed_at || (meta.scan_end ? meta.scan_end * 1000 : null))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
              <span className="font-mono">{meta.total_nodes || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Targets Scanned:</span>
              <span className="font-mono">{meta.targets_scanned || 'N/A'}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default SuiScanResult;