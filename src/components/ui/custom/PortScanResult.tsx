import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Network, Shield, Settings, FileSearch, AlertTriangle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PortScanResultProps {
  result: any;
}

const formatTimestamp = (timestamp: string | number | null): string => {
  if (!timestamp) return 'N/A';
  try {
    let date: Date;
    if (typeof timestamp === 'number') {
      const now = Date.now();
      const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
      if (timestampMs < 946684800000 || timestampMs > now + 365 * 24 * 60 * 60 * 1000) {
        return 'Invalid date';
      }
      date = new Date(timestampMs);
    } else {
      date = new Date(timestamp);
      if (date.getTime() < 946684800000) {
        return 'Invalid date';
      }
    }
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
};

const getServiceColor = (service: string): string => {
  switch (service?.toLowerCase()) {
    case 'http':
    case 'https':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'ssh':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'ftp':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'unknown':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  }
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 70) return 'text-green-600 dark:text-green-400';
  if (confidence >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
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

const ScanLogViewer: React.FC<{ logs: string[] }> = ({ logs }) => {
  const [showLogs, setShowLogs] = useState(false);

  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLogs(!showLogs)}
        className="text-xs"
      >
        {showLogs ? 'Hide Logs' : 'Show Scan Logs'}
      </Button>
      {showLogs && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PortScanResult: React.FC<PortScanResultProps> = ({ result }) => {
  if (!result?.pgdn_result?.data?.[0]?.payload) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>No port scan data available</p>
      </div>
    );
  }

  const payload = result.pgdn_result.data[0].payload;
  const meta = result.pgdn_result.meta || {};
  const scanSummary = payload.scan_summary || {};
  const scanConfig = payload.scan_config || {};
  const detailedResults = payload.detailed_results || [];

  return (
    <div className="space-y-4">
      {/* Scan Summary */}
      <SectionCard
        title="Port Scan Summary"
        icon={<Network className="h-5 w-5 text-blue-600" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Target:</span>
              <span className="font-mono">{payload.target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scanner Type:</span>
              <Badge variant="outline">{payload.scanner_type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan Duration:</span>
              <span className="font-mono">{payload.duration || 'N/A'}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
              <span className="font-mono text-sm">{formatTimestamp(payload.timestamp)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Ports:</span>
              <span className="font-mono">{scanSummary.total_ports || payload.open_ports?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Open Ports:</span>
              <span className="font-mono text-green-600">{scanSummary.open_ports || payload.open_ports?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Closed Ports:</span>
              <span className="font-mono text-red-600">{scanSummary.closed_ports || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Confidence:</span>
              <span className={`font-mono ${getConfidenceColor(scanSummary.average_confidence || 0)}`}>
                {scanSummary.average_confidence ? `${scanSummary.average_confidence.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Ports Tested Overview */}
        {detailedResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Ports Tested</h4>
            <div className="flex flex-wrap gap-2">
              {detailedResults.map((portResult: any) => {
                const isHighConfidence = portResult.confidence_score >= 80;
                const isOpen = portResult.is_open && isHighConfidence;
                const isFiltered = portResult.is_open && !isHighConfidence;
                
                return (
                  <Badge key={portResult.port} className={
                    isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    isFiltered ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }>
                    {portResult.port} {isFiltered && '?'}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Detailed Port Results */}
      {detailedResults.length > 0 && (
        <SectionCard
          title={`Detailed Port Analysis (${detailedResults.length} ports)`}
          icon={<FileSearch className="h-5 w-5 text-purple-600" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            {detailedResults.map((portResult: any, index: number) => {
              const isHighConfidence = portResult.confidence_score >= 80;
              const isOpen = portResult.is_open && isHighConfidence;
              const isFiltered = portResult.is_open && !isHighConfidence;
              
              return (
                <div key={`${portResult.port}-${index}`} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : isFiltered ? (
                          <Filter className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-semibold text-lg">Port {portResult.port}</span>
                      </div>
                    <Badge className={getServiceColor(portResult.service)}>
                      {portResult.service || 'unknown'}
                    </Badge>
                    <Badge variant="outline" className={getConfidenceColor(portResult.confidence_score)}>
                      {portResult.confidence_score ? `${portResult.confidence_score.toFixed(1)}%` : 'N/A'}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatTimestamp(portResult.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <Badge className={
                        isOpen ? 'bg-green-100 text-green-800' :
                        isFiltered ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {isOpen ? 'Open' : isFiltered ? 'Filtered' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Service:</span>
                      <span className="font-mono">{portResult.service || 'unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Version:</span>
                      <span className="font-mono">{portResult.version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Banner:</span>
                      <span className="font-mono text-xs">{portResult.banner || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className={`font-mono ${getConfidenceColor(portResult.confidence_score)}`}>
                        {portResult.confidence_score ? `${portResult.confidence_score.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">SSL Info:</span>
                      <span className="font-mono">{portResult.ssl_info ? 'Available' : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">HTTP Info:</span>
                      <span className="font-mono">{portResult.http_info ? 'Available' : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Nmap Results */}
                {portResult.nmap_results && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border">
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Nmap Results
                    </h5>
                    {portResult.nmap_results.error ? (
                      <div className="text-sm text-red-600">
                        <strong>Error:</strong> {portResult.nmap_results.error}
                        {portResult.nmap_results.timeout_duration && (
                          <span> (timeout: {portResult.nmap_results.timeout_duration}s)</span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {portResult.nmap_results.status && (
                          <div className="text-xs">
                            <strong>Status:</strong> {portResult.nmap_results.status}
                          </div>
                        )}
                        {portResult.nmap_results.raw_output && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Raw Output
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs overflow-x-auto">
                              {portResult.nmap_results.raw_output}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Scan Logs */}
                <ScanLogViewer logs={portResult.scan_log} />
              </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Scan Configuration */}
      {Object.keys(scanConfig).length > 0 && (
        <SectionCard
          title="Scan Configuration"
          icon={<Settings className="h-5 w-5 text-gray-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Timeout:</span>
                <span className="font-mono">{scanConfig.timeout || 'N/A'}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Connect Timeout:</span>
                <span className="font-mono">{scanConfig.connect_timeout || 'N/A'}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Read Timeout:</span>
                <span className="font-mono">{scanConfig.read_timeout || 'N/A'}s</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Nmap Timeout:</span>
                <span className="font-mono">{scanConfig.nmap_timeout || 'N/A'}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max Threads:</span>
                <span className="font-mono">{scanConfig.max_threads || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Skip Nmap:</span>
                <Badge className={scanConfig.skip_nmap ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {scanConfig.skip_nmap ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Scan Metadata */}
      <SectionCard
        title="Scan Metadata"
        icon={<Clock className="h-5 w-5 text-gray-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Operation:</span>
              <span className="font-mono">{meta.operation || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Stage:</span>
              <span className="font-mono">{meta.stage || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Protocol:</span>
              <span className="font-mono">{meta.protocol || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan Start:</span>
              <span className="font-mono text-sm">{formatTimestamp(meta.scan_start)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scan End:</span>
              <span className="font-mono text-sm">{formatTimestamp(meta.scan_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
              <span className="font-mono">{meta.total_scan_duration || 'N/A'}s</span>
            </div>
          </div>
        </div>

        {/* Scanners Used */}
        {meta.scanners_used && meta.scanners_used.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Scanners Used</h4>
            <div className="flex flex-wrap gap-2">
              {meta.scanners_used.map((scanner: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {scanner}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default PortScanResult;