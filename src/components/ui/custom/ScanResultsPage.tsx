import React, { useMemo } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
  const node = result?.pgdn_result?.data?.[0]?.payload;
  if (!node) return <div>No node scan data.</div>;
  return (
    <div>
      <div className="mb-2">Open Ports: {Array.isArray(node.open_ports) ? node.open_ports.join(', ') : 'N/A'}</div>
      <b>Port Scan Results:</b>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Port</TableHead>
            <TableHead>Banner</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(node.results) && node.results.map((r: any, i: number) => (
            <TableRow key={i}>
              <TableCell>{r.port}</TableCell>
              <TableCell className="font-mono text-xs">{r.banner || '-'}</TableCell>
              <TableCell className={r.error ? 'text-red-600' : ''}>{r.error || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
            {detailedResults.confidence * 100}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Confidence</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {detailedResults.total_scan_time?.toFixed(2)}s
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
              <div><span className="font-medium">Hostname:</span> {detailedResults.hostname}</div>
              <div><span className="font-medium">IP:</span> {detailedResults.ip}</div>
              <div><span className="font-medium">Network:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  detailedResults.network === 'mainnet' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                  {detailedResults.network}
                </span>
              </div>
              <div><span className="font-medium">Node Type:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                  detailedResults.node_type === 'validator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  detailedResults.node_type === 'public_rpc' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  detailedResults.node_type === 'hybrid' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {detailedResults.node_type}
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
          {detailedResults.capabilities?.map((capability: string, index: number) => (
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
          <h3 className="text-lg font-semibold mb-3">Accessible Ports ({detailedResults.accessible_ports?.length || 0})</h3>
          <div className="flex flex-wrap gap-1">
            {detailedResults.accessible_ports?.map((port: number, index: number) => (
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
            {detailedResults.working_endpoints?.map((endpoint: string, index: number) => (
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
            <div className="text-lg font-semibold">{detailedResults.discovery_time?.toFixed(3)}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Classification Time</div>
            <div className="text-lg font-semibold">{detailedResults.classification_time?.toFixed(3)}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Scan Time</div>
            <div className="text-lg font-semibold">{detailedResults.total_scan_time?.toFixed(3)}s</div>
          </div>
        </div>
      </div>

      {/* Analysis Level */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Analysis Details</h3>
        <div className="space-y-2">
          <div><span className="font-medium">Analysis Level:</span> 
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
              {detailedResults.analysis_level}
            </span>
          </div>
          <div><span className="font-medium">Discovered At:</span> {new Date(detailedResults.discovered_at).toLocaleString()}</div>
          <div><span className="font-medium">Scanner Method:</span> {result.scan_method || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

// 8. Deep Discovery Scan (likely similar format to discovery but with more detailed analysis)
const DeepDiscoveryScanResult: React.FC<{ result: any }> = ({ result }) => {
  console.log('DeepDiscoveryScanResult - Raw result:', result);
  
  // Extract the deep discovery data from the nested structure
  const scanResults = result?.scan_results;
  const enhancedResults = scanResults?.enhanced_results?.[0]?.enhanced_data;
  const nodeData = enhancedResults?.nodes?.[0];
  const scanSummary = enhancedResults?.scan_summary;
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Deep Discovery Analysis</h2>
            <p className="text-blue-100">Enhanced protocol analysis with comprehensive security assessment</p>
          </div>
        </div>
      </div>

      {/* Scan Summary Cards */}
      {scanSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scanSummary.total_nodes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scanSummary.analysis_levels?.deep || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Deep Analysis</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{scanSummary.by_network?.mainnet || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mainnet Nodes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{nodeData.total_scan_time?.toFixed(1) || 'N/A'}s</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Scan Duration</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          Node Information
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Basic Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hostname</span>
                  <span className="font-mono text-sm font-medium">{nodeData.hostname || nodeData.ip || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">IP Address</span>
                  <span className="font-mono text-sm font-medium">{nodeData.ip || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    nodeData.network === 'mainnet' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {nodeData.network || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Node Type</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    nodeData.node_type === 'validator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    nodeData.node_type === 'public_rpc' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    nodeData.node_type === 'hybrid' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {nodeData.node_type || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                  <span className="text-sm font-medium">{nodeData.confidence ? `${Math.round(nodeData.confidence * 100)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Discovered At</span>
                  <span className="text-sm font-medium">{new Date(nodeData.discovered_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {nodeData.capabilities?.map((capability: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                    {capability.replace(/_/g, ' ')}
                  </span>
                )) || <span className="text-gray-500 dark:text-gray-400">No capabilities detected</span>}
              </div>
            </div>

            {/* Working Endpoints */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Working Endpoints</h4>
              <div className="space-y-2">
                {nodeData.working_endpoints?.map((endpoint: string, index: number) => (
                  <div key={index} className="font-mono text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded border">
                    {endpoint}
                  </div>
                )) || <span className="text-gray-500 dark:text-gray-400">No working endpoints found</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network & Security Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accessible Ports */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
            Accessible Ports ({nodeData.accessible_ports?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {nodeData.accessible_ports?.map((port: number, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-mono">
                {port}
              </span>
            )) || <span className="text-gray-500 dark:text-gray-400">No accessible ports found</span>}
          </div>
        </div>

        {/* Security Assessment */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Security Assessment
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overall Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                nodeData.health_status?.overall_status === 'healthy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {nodeData.health_status?.overall_status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">RPC Available</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                nodeData.health_status?.rpc_available === 'True' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {nodeData.health_status?.rpc_available || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">gRPC Available</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                nodeData.health_status?.grpc_available === 'True' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {nodeData.health_status?.grpc_available || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Open Ports</span>
              <span className="text-sm font-medium">{nodeData.security_scan?.open_ports_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Version Information */}
      {nodeData.version_info && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Version Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Protocol Version</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.protocol_version || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Chain Identifier</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.chain_identifier || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.total_transactions || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Latest Checkpoint</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.latest_checkpoint_sequence || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Protocol Version</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.max_supported_protocol_version || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Min Protocol Version</div>
              <div className="font-mono text-sm font-medium">{nodeData.version_info.min_supported_protocol_version || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
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
export const ScanResultsPage: React.FC<{ scanData: any }> = ({ scanData }) => {
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
      scanTime: scanData?.created_at || scanData?.scan_time || scanData?.session_start || '-',
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