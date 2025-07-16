import React, { useMemo } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText } from 'lucide-react';

/**
 * ScanResultsPage Component
 * 
 * Handles parsing and display of various scan types including:
 * - Web scans, Node scans, SSL scans, WhatWeb scans, Geo scans, Compliance scans
 * - Discovery scans (NEW) - Shows detailed discovery results with node info, capabilities, endpoints
 * - Deep Discovery scans (NEW) - Enhanced discovery analysis
 * 
 * The discovery scan format includes:
 * - Node type (validator/public_rpc/hybrid), network (mainnet/testnet), confidence level
 * - Accessible ports, working endpoints, capabilities
 * - Performance metrics (discovery_time, classification_time, total_scan_time)
 * - Protocol information and analysis details
 */

// Helper: Pretty JSON viewer
const JsonViewer: React.FC<{ data: any }> = ({ data }) => (
  <pre className="overflow-x-auto bg-gray-100 dark:bg-gray-900 text-xs rounded p-4 mt-2 mb-2 max-h-96 whitespace-pre-wrap">
    {JSON.stringify(data, null, 2)}
  </pre>
);

// --- Subcomponents for each scan type ---

// 1. Web Scan
const WebScanResult: React.FC<{ result: any }> = ({ result }) => {
  const web = result?.pgdn_result?.data?.[0]?.payload?.web_scan;
  if (!web) return <div>No web scan data.</div>;
  return (
    <div>
      <div className="mb-2">Web Server Detected: <b>{web.web_server_detected ? 'Yes' : 'No'}</b></div>
      <div className="mb-2">Open Ports: {Array.isArray(web.open_ports) ? web.open_ports.join(', ') : 'N/A'}</div>
      {web.tls_info?.error && (
        <div className="mb-2 text-red-600">TLS Error: {web.tls_info.error}</div>
      )}
      {web.http_headers && (
        <div className="mb-2">
          <b>HTTP Headers by Port:</b>
          {Object.entries(web.http_headers).map(([port, headers]: any) => (
            <div key={port} className="mb-2">
              <div className="font-semibold">Port {port}</div>
              <Table>
                <TableBody>
                  {Object.entries(headers).map(([k, v]: any) => (
                    <TableRow key={k}>
                      <TableCell className="font-mono text-xs">{k}</TableCell>
                      <TableCell className="font-mono text-xs">{String(v)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. Node Scan
const NodeScanResult: React.FC<{ result: any }> = ({ result }) => {
  const nodeData = result?.pgdn_result?.data?.[0]?.payload;
  if (!nodeData) return <div>No node scan data.</div>;
  
  const scanResults = nodeData.results || [];
  const openPorts = nodeData.open_ports || [];
  const detectedServices = nodeData.detected_services || [];
  
  // Group results by port for better display
  const resultsByPort = scanResults.reduce((acc: any, result: any) => {
    if (!acc[result.port]) {
      acc[result.port] = [];
    }
    acc[result.port].push(result);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {nodeData.total_probes || 0}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Probes</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {nodeData.successful_probes || 0}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Successful Probes</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {openPorts.length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Open Ports</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {nodeData.duration || 0}s
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Scan Duration</div>
        </div>
      </div>

      {/* Target Information */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Scan Target</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Target</div>
            <div className="font-medium font-mono">{nodeData.target}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Protocol</div>
            <div className="font-medium">{nodeData.protocol?.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Scanner Type</div>
            <div className="font-medium">{nodeData.scanner_type}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Scan Level</div>
            <div className="font-medium">{nodeData.scan_level}</div>
          </div>
        </div>
      </div>

      {/* Open Ports */}
      {openPorts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Open Ports</h3>
          <div className="flex flex-wrap gap-2">
            {openPorts.map((port: number) => (
              <span key={port} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-mono">
                {port}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detected Services */}
      {detectedServices.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Detected Services</h3>
          <div className="flex flex-wrap gap-2">
            {detectedServices.map((service: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Results by Port */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Detailed Scan Results</h3>
        {Object.keys(resultsByPort).length === 0 ? (
          <p className="text-gray-500">No scan results available.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(resultsByPort).map(([port, portResults]: [string, any]) => (
              <div key={port} className="border rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  Port {port}
                  {openPorts.includes(parseInt(port)) && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                      OPEN
                    </span>
                  )}
                </h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Probe</TableHead>
                        <TableHead>SSL</TableHead>
                        <TableHead>Latency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Banner/Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portResults.map((result: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{result.probe}</TableCell>
                          <TableCell>
                            {result.ssl ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                                SSL
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded text-xs">
                                Plain
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {result.latency_ms ? `${result.latency_ms.toFixed(1)}ms` : '-'}
                          </TableCell>
                          <TableCell>
                            {result.error ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs">
                                {result.error}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">
                                Success
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-xs">
                            {result.banner ? (
                              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-hidden">
                                {result.banner.length > 100 ? `${result.banner.substring(0, 100)}...` : result.banner}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. SSL Scan
const SslScanResult: React.FC<{ result: any }> = ({ result }) => {
  const ssl = result?.pgdn_result?.data?.[0]?.payload?.ssl_test;
  if (!ssl) return <div>No SSL scan data.</div>;
  return (
    <div>
      {ssl.error ? (
        <div className="text-red-600">SSL Error: {ssl.error}</div>
      ) : (
        <div>No SSL errors reported.</div>
      )}
    </div>
  );
};

// 4. WhatWeb Scan
const WhatWebScanResult: React.FC<{ result: any }> = ({ result }) => {
  const whatweb = result?.pgdn_result?.data?.[0]?.payload?.whatweb;
  if (!whatweb) return <div>No WhatWeb scan data.</div>;
  return (
    <div>
      {Object.entries(whatweb).map(([endpoint, info]: any) => (
        <div key={endpoint} className="mb-4">
          <div className="font-semibold">{endpoint}</div>
          <div>HTTP Status: {info.http_status}</div>
          {info.plugins && (
            <div>
              <b>Plugins:</b>
              <ul className="list-disc ml-6">
                {Object.entries(info.plugins).map(([plugin, details]: any) => (
                  <li key={plugin}>
                    <span className="font-mono text-xs">{plugin}</span>: {details.string ? details.string.join(', ') : JSON.stringify(details)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// 5. Geo Scan
const GeoScanResult: React.FC<{ result: any }> = ({ result }) => {
  const geo = result?.pgdn_result?.data?.[0]?.payload?.geoip;
  if (!geo) return <div>No geo scan data.</div>;
  return (
    <div>
      <div>Country: <b>{geo.country_name}</b></div>
      <div>City: <b>{geo.city_name}</b></div>
      <div>Coordinates: <b>{geo.latitude}, {geo.longitude}</b></div>
    </div>
  );
};

// 6. Compliance Scan
const ComplianceScanResult: React.FC<{ result: any }> = ({ result }) => {
  const compliance = result?.pgdn_result?.data?.[0]?.payload?.compliance;
  if (!compliance) return <div>No compliance scan data.</div>;
  return (
    <div>
      <div className="mb-2">Compliance Flags: {Array.isArray(compliance.compliance_flags) ? compliance.compliance_flags.join(', ') : 'None'}</div>
      <div className="mb-2">Healthy Nodes: {compliance.summary?.healthy_nodes ?? 'N/A'}</div>
      <div className="mb-2">Successful Scans: {compliance.summary?.successful_scans ?? 'N/A'}</div>
      <div className="mb-2">Scan Success Rate: {compliance.summary?.scan_success_rate ?? 'N/A'}</div>
    </div>
  );
};

// 7. Discovery Scan
const DiscoveryScanResult: React.FC<{ result: any }> = ({ result }) => {
  console.log('DiscoveryScanResult - Raw result:', result);
  
  // Check if scan failed
  if (result?.success === false || result?.discovery_result?.success === false) {
    const errorMessage = result?.error_message || result?.discovery_result?.error_message || 'Discovery scan failed';
    const target = result?.target || result?.scan_params?.target || 'Unknown target';
    
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Discovery Scan Failed</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-medium">Target:</span> {target}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-medium">Error:</span> {errorMessage}
            </p>
            {result?.discovery_result?.protocols_found !== undefined && (
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">Protocols Found:</span> {result.discovery_result.protocols_found}
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 rounded">
            <p className="text-sm text-red-800 dark:text-red-200">
              The discovery scan was unable to identify the target node or detect any supported protocols. 
              This could indicate that the target is not accessible, not running supported services, or is behind a firewall.
            </p>
          </div>
        </div>
        
        {/* Optional: Show scan attempt details if available */}
        {(result?.scan_params || result?.discovery_result?.matched_protocols?.length > 0) && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Scan Details</h4>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              {result?.scan_params?.target && (
                <div><span className="font-medium">Target:</span> {result.scan_params.target}</div>
              )}
              {result?.scan_params?.run && (
                <div><span className="font-medium">Scan Type:</span> {result.scan_params.run}</div>
              )}
              {result?.discovery_result?.matched_protocols && (
                <div><span className="font-medium">Matched Protocols:</span> {result.discovery_result.matched_protocols.join(', ') || 'None'}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  const discoveryResult = result?.discovery_result;
  if (!discoveryResult) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Discovery Scan</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            No discovery_result found in scan data. Raw scan data:
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <JsonViewer data={result} />
        </div>
      </div>
    );
  }

  const detailedResults = discoveryResult.detailed_results?.[0];
  if (!detailedResults) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Discovery Scan</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            No detailed_results found in discovery_result. Available data:
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <JsonViewer data={discoveryResult} />
        </div>
      </div>
    );
  }

  // Extract the actual node data from the payload
  const nodeData = detailedResults.payload || detailedResults;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {discoveryResult.protocols_found}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Protocols Found</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(nodeData.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Confidence</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {nodeData.total_scan_time?.toFixed(2)}s
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Scan Duration</div>
        </div>
      </div>

      {/* Node Information */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Node Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-medium mb-2">Basic Details</div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Hostname:</span> {nodeData.hostname}</div>
              <div><span className="font-medium">IP:</span> {nodeData.ip}</div>
              <div><span className="font-medium">Network:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  nodeData.network === 'mainnet' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {nodeData.network}
                </span>
              </div>
              <div><span className="font-medium">Node Type:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  nodeData.node_type === 'validator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  nodeData.node_type === 'public_rpc' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  nodeData.node_type === 'hybrid' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {nodeData.node_type}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Protocols</div>
            <div className="flex flex-wrap gap-1">
              {discoveryResult.matched_protocols?.map((protocol: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                  {protocol.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
        <div className="flex flex-wrap gap-2">
          {nodeData.capabilities?.map((capability: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
              {capability.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Network Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accessible Ports */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Accessible Ports ({nodeData.accessible_ports?.length || 0})</h3>
          <div className="flex flex-wrap gap-1">
            {nodeData.accessible_ports?.map((port: number, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-mono">
                {port}
              </span>
            ))}
          </div>
        </div>

        {/* Working Endpoints */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Working Endpoints</h3>
          <div className="space-y-2">
            {nodeData.working_endpoints?.map((endpoint: string, index: number) => (
              <div key={index} className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                {endpoint}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Discovery Time</div>
            <div className="text-lg font-semibold">{nodeData.discovery_time?.toFixed(3)}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Classification Time</div>
            <div className="text-lg font-semibold">{nodeData.classification_time?.toFixed(3)}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Scan Time</div>
            <div className="text-lg font-semibold">{nodeData.total_scan_time?.toFixed(3)}s</div>
          </div>
        </div>
      </div>

      {/* Analysis Level */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Analysis Details</h3>
        <div className="space-y-2">
          <div><span className="font-medium">Analysis Level:</span> 
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
              {nodeData.analysis_level}
            </span>
          </div>
          <div><span className="font-medium">Discovered At:</span> {new Date(nodeData.discovered_at).toLocaleString()}</div>
          <div><span className="font-medium">Scanner Method:</span> {result.scan_method || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

// 8. Deep Discovery Scan (updated for new JSON format)
const DeepDiscoveryScanResult: React.FC<{ result: any }> = ({ result }) => {
  console.log('DeepDiscoveryScanResult - Raw result:', result);
  
  // Handle new JSON format: result.scan_results.pgdn_result.data[0].payload
  let nodeData;
  
  if (result?.scan_results?.pgdn_result?.data?.[0]?.payload) {
    nodeData = result.scan_results.pgdn_result.data[0].payload;
  } else if (result?.pgdn_result?.data?.[0]?.payload) {
    nodeData = result.pgdn_result.data[0].payload;
  } else {
    // Fallback to old format for backward compatibility
    let scanResults, enhancedResults;
    if (result?.enhanced_results) {
      scanResults = result;
      enhancedResults = scanResults.enhanced_results?.[0]?.enhanced_data;
      nodeData = enhancedResults?.nodes?.[0];
    } else if (result?.scan_results?.enhanced_results) {
      scanResults = result.scan_results;
      enhancedResults = scanResults.enhanced_results?.[0]?.enhanced_data;
      nodeData = enhancedResults?.nodes?.[0];
    }
  }

  if (!nodeData) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Deep Discovery Scan</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            No deep discovery node data found. Raw scan data:
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <JsonViewer data={result} />
        </div>
      </div>
    );
  }

  // Extract data from new format
  const endpointDetails = nodeData?.endpoint_details || {};
  const securityScan = nodeData?.security_scan || {};
  const healthStatus = nodeData?.health_status || {};
  const versionInfo = nodeData?.version_info || {};

  // Filter Docker API to only show entries without error
  const dockerApiEntries = endpointDetails.docker_api ? Object.entries(endpointDetails.docker_api).filter(([_, info]: any) => !info.error) : [];
  // Filter banners to only show non-empty
  const bannerEntries = endpointDetails.banners ? Object.entries(endpointDetails.banners).filter(([_, banner]: any) => banner) : [];

  // For backward compatibility, try to extract scanSummary and scanResults
  const scanSummary = result?.enhanced_results?.[0]?.enhanced_data?.scan_summary || result?.scan_results?.enhanced_results?.[0]?.enhanced_data?.scan_summary || {};
  const scanResults = result?.scan_results || result;

  // Helper to render key-value pairs as a table
  const renderKVTable = (obj: any) => (
    <Table>
      <TableBody>
        {Object.entries(obj).map(([k, v]: any) => (
          <TableRow key={k}>
            <TableCell className="font-mono text-xs">{k}</TableCell>
            <TableCell className="font-mono text-xs">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Icon helpers
  const SectionIcon = ({ name }: { name: string }) => {
    switch (name) {
      case 'version':
        return (<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
      case 'health':
        return (<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);
      case 'endpoint':
        return (<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" /></svg>);
      case 'service':
        return (<svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16" /></svg>);
      case 'security':
        return (<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7m0 8v-2m-6 4a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>);
      case 'network':
        return (<svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>);
      default:
        return null;
    }
  };

  // Main return: display the new format data
  return (
    <React.Fragment>
      <div className="space-y-6">
        {/* Node Summary (NEW FORMAT) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SectionIcon name="network" />
            Node Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2"><strong>Host:</strong> {nodeData.hostname || nodeData.ip || '-'}</div>
              <div className="mb-2"><strong>Node Type:</strong> {nodeData.node_type || '-'}</div>
              <div className="mb-2"><strong>Network:</strong> {nodeData.network || '-'}</div>
              <div className="mb-2"><strong>Confidence:</strong> {nodeData.confidence || '-'}</div>
            </div>
            <div>
              <div className="mb-2"><strong>Analysis Level:</strong> {nodeData.analysis_level || '-'}</div>
              <div className="mb-2"><strong>Discovery Time:</strong> {nodeData.discovery_time ? `${nodeData.discovery_time.toFixed(2)}s` : '-'}</div>
              <div className="mb-2"><strong>Total Scan Time:</strong> {nodeData.total_scan_time ? `${nodeData.total_scan_time.toFixed(2)}s` : '-'}</div>
            </div>
          </div>
          {nodeData.capabilities && nodeData.capabilities.length > 0 && (
            <div className="mt-4">
              <strong>Capabilities:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {nodeData.capabilities.map((cap: string) => (
                  <span key={cap} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">{cap}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Health Status */}
        {healthStatus?.overall_status && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="health" />
              Health Status
            </h3>
            <div className="mb-2"><strong>Overall Status:</strong> <span className={healthStatus.overall_status === 'healthy' ? 'text-green-600' : 'text-red-600'}>{healthStatus.overall_status}</span></div>
            {Array.isArray(healthStatus.capabilities_working) && healthStatus.capabilities_working.length > 0 && (
              <div className="mb-2">
                <strong>Working Capabilities:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {healthStatus.capabilities_working.map((cap: string) => (
                    <span key={cap} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs">{cap}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div><strong>RPC Available:</strong> {healthStatus.rpc_available || 'N/A'}</div>
              <div><strong>gRPC Available:</strong> {healthStatus.grpc_available || 'N/A'}</div>
              <div><strong>Metrics Available:</strong> {healthStatus.metrics_available || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Version Info */}
        {versionInfo && Object.keys(versionInfo).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="version" />
              Version Info
            </h3>
            {renderKVTable(versionInfo)}
          </div>
        )}

        {/* Working Endpoints */}
        {nodeData.working_endpoints && nodeData.working_endpoints.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="endpoint" />
              Working Endpoints
            </h3>
            <div className="space-y-2">
              {nodeData.working_endpoints.map((endpoint: string) => (
                <div key={endpoint} className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">{endpoint}</div>
              ))}
            </div>
          </div>
        )}

        {/* Accessible Ports */}
        {nodeData.accessible_ports && nodeData.accessible_ports.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="service" />
              Accessible Ports
            </h3>
            <div className="flex flex-wrap gap-2">
              {nodeData.accessible_ports.map((port: number) => (
                <span key={port} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-mono">{port}</span>
              ))}
            </div>
          </div>
        )}

        {/* Security Scan */}
        {securityScan && Object.keys(securityScan).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="security" />
              Security Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2"><strong>Open Ports Count:</strong> {securityScan.open_ports_count || 0}</div>
                {securityScan.ssl_ports && securityScan.ssl_ports.length > 0 && (
                  <div className="mb-2">
                    <strong>SSL Ports:</strong> {securityScan.ssl_ports.join(', ')}
                  </div>
                )}
              </div>
              <div>
                {securityScan.standard_ports && securityScan.standard_ports.length > 0 && (
                  <div className="mb-2">
                    <strong>Standard Ports:</strong> {securityScan.standard_ports.join(', ')}
                  </div>
                )}
                {securityScan.non_standard_ports && securityScan.non_standard_ports.length > 0 && (
                  <div className="mb-2">
                    <strong>Non-Standard Ports:</strong> {securityScan.non_standard_ports.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Endpoint Details */}
        {(bannerEntries.length > 0 || (endpointDetails.http_headers && Object.keys(endpointDetails.http_headers).length > 0) || dockerApiEntries.length > 0) && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="service" />
              Endpoint Details
            </h3>
            
            {/* Banners (only show if non-error) */}
            {bannerEntries.length > 0 && (
              <div>
                <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />Banners</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port</TableHead>
                      <TableHead>Banner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannerEntries.map(([port, banner]: any) => (
                      <TableRow key={port}>
                        <TableCell className="font-mono text-xs">{port}</TableCell>
                        <TableCell className="font-mono text-xs">{banner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* HTTP Headers */}
            {endpointDetails.http_headers && Object.keys(endpointDetails.http_headers).length > 0 && (
              <div className="mt-6">
                <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />HTTP Headers</div>
                {Object.entries(endpointDetails.http_headers).map(([port, info]: any) => (
                  <div key={port} className="mb-4">
                    <div className="font-semibold">Port {port} (Status: {info.status_code})</div>
                    <Table>
                      <TableBody>
                        {info.headers && Object.entries(info.headers).map(([k, v]: any) => (
                          <TableRow key={k}>
                            <TableCell className="font-mono text-xs">{k}</TableCell>
                            <TableCell className="font-mono text-xs">{String(v)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Raw Data (for debugging) */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              Raw Scan Data (Click to expand)
            </summary>
            <div className="mt-3">
              <JsonViewer data={result} />
            </div>
          </details>
        </div>
        {/* Performance Metrics (BOTTOM) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {nodeData.discovery_time ? `${nodeData.discovery_time.toFixed(3)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Discovery Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {nodeData.classification_time ? `${nodeData.classification_time.toFixed(3)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Classification Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {nodeData.total_scan_time ? `${nodeData.total_scan_time.toFixed(3)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Scan Time</div>
            </div>
          </div>
        </div>
        {/* Scanner Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scanner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Scanner Version</div>
              <div className="font-medium">{scanSummary?.scanner_version || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Scan Timestamp</div>
              <div className="font-medium">{scanSummary?.scan_timestamp ? new Date(scanSummary.scan_timestamp).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Level</div>
              <div className="font-medium">{nodeData.analysis_level || 'Deep Discovery'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Scan Method</div>
              <div className="font-medium">{scanResults?.scan_method || 'Direct Deep Scan'}</div>
            </div>
          </div>
        </div>
        {/* Raw Data (for debugging) */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              Raw Scan Data (Click to expand)
            </summary>
            <div className="mt-3">
              <JsonViewer data={result} />
            </div>
          </details>
        </div>
      </div>
    </React.Fragment>
  );
};

// 9. Fallback for unknown scan types
const FallbackScanResult: React.FC<{ result: any }> = ({ result }) => (
  <div>
    <div className="mb-2">Unknown scan type. Raw data:</div>
    <JsonViewer data={result} />
  </div>
);

// --- Main ScanResultsPage Component ---

/**
 * ScanResultsPage
 * Props:
 *   scanData: the top-level scan session object (see requirements)
 *
 * Renders summary info, tabs for each scan type, and a subcomponent for each scan result.
 */
export const ScanResultsPage: React.FC<{ 
  scanData: any; 
  onDispute?: (scanType: string, target: string, sessionId?: string) => void;
  onGenerateReport?: () => void;
  isReportLoading?: boolean;
  canGenerateReport?: boolean;
}> = ({ scanData, onDispute, onGenerateReport, isReportLoading }) => {
  // Extract scan types and results
  const scanResults = Array.isArray(scanData?.scan_results) ? scanData.scan_results : [];

  // Map scan type to subcomponent
  const getScanComponent = (scanType: string) => {
    switch (scanType) {
      case 'web': return WebScanResult;
      case 'node_scan': return NodeScanResult;
      case 'ssl':
      case 'ssl_test': return SslScanResult;
      case 'whatweb': return WhatWebScanResult;
      case 'geo': return GeoScanResult;
      case 'compliance': return ComplianceScanResult;
      case 'discovery': return DiscoveryScanResult;
      case 'deep_discovery': return DeepDiscoveryScanResult;
      default: return FallbackScanResult;
    }
  };

  // Summary info
  const summary = useMemo(() => {
    return {
      target: scanData?.target || '-',
      nodeIp: scanData?.normalized_data?.geo?.ip || scanData?.normalized_data?.ip || scanData?.node_ip || '-',
      scanTime: scanData?.started_at || scanData?.created_at || scanData?.scan_time || scanData?.session_start || '-',
      score: scanData?.score_data?.score,
      scoreSummary: scanData?.score_data?.summary,
      scoreFlags: scanData?.score_data?.flags,
    };
  }, [scanData]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* --- Summary Info --- */}
      <div className="mb-6 p-4 rounded bg-surface-secondary border border-border">
        <div className="flex flex-wrap gap-6 items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Target: <span className="font-mono">{summary.target}</span></div>
            <div className="text-sm text-muted-foreground">Node IP: <span className="font-mono">{summary.nodeIp}</span></div>
            <div className="text-sm text-muted-foreground">Scan Time: <span className="font-mono">{summary.scanTime}</span></div>
          </div>
          {summary.score !== undefined && (
            <div className="flex flex-col items-end">
              <div className="text-lg font-bold">Security Score: {summary.score}/100</div>
              {summary.scoreSummary && <div className="text-xs text-muted-foreground">{summary.scoreSummary}</div>}
            </div>
          )}
        </div>
        {summary.score !== undefined && Array.isArray(summary.scoreFlags) && summary.scoreFlags.length > 0 && (
          <ul className="list-disc ml-6 mt-1 text-xs text-red-600">
            {summary.scoreFlags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
          </ul>
        )}
      </div>

      {/* --- Scan Results List --- */}
      <div className="space-y-10">
        {scanResults.map((r: any, idx: number) => {
          const ScanComponent = getScanComponent(r.scan_type);
          return (
            <div key={r.scan_type + '-' + idx} className="border rounded bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold capitalize">{r.scan_type} Scan</h2>
                <div className="flex items-center gap-2">
                  {onDispute && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDispute(r.scan_type, summary.target, scanData?.session_id)}
                      className="text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Dispute
                    </Button>
                  )}
                  {onGenerateReport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onGenerateReport}
                      disabled={isReportLoading || r.scan_type !== 'deep_discovery'}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {isReportLoading ? 'Creating...' : 'Create Report'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Inline download logic (no helper)
                      const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `scan-${r.scan_type}-${idx + 1}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download JSON
                  </Button>
                </div>
              </div>
              <ScanComponent result={r.scan_results} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Default export for standalone usage
export default ScanResultsPage; 