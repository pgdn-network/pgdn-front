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
  // Robustly handle deep_discovery API response structure
  let scanResults, enhancedResults, nodeData, scanSummary;
  if (result?.enhanced_results) {
    scanResults = result;
    enhancedResults = scanResults.enhanced_results?.[0]?.enhanced_data;
    nodeData = enhancedResults?.nodes?.[0];
    scanSummary = enhancedResults?.scan_summary;
  } else if (result?.scan_results?.enhanced_results) {
    scanResults = result.scan_results;
    enhancedResults = scanResults.enhanced_results?.[0]?.enhanced_data;
    nodeData = enhancedResults?.nodes?.[0];
    scanSummary = enhancedResults?.scan_summary;
  } else {
    nodeData = undefined;
  }
  const endpointDetails = nodeData?.endpoint_details || {};
  const securityScan = nodeData?.security_scan || {};
  const sslInfo = nodeData?.ssl_info || {};
  const serviceVersions = nodeData?.service_versions || {};

  // Filter Docker API to only show entries without error
  const dockerApiEntries = endpointDetails.docker_api ? Object.entries(endpointDetails.docker_api).filter(([_, info]: any) => !info.error) : [];
  // Filter banners to only show non-empty
  const bannerEntries = endpointDetails.banners ? Object.entries(endpointDetails.banners).filter(([_, banner]: any) => banner) : [];
  // Filter SSL certificates to only show those with some data
  const sslCertEntries = sslInfo.certificates ? Object.entries(sslInfo.certificates).filter(([_, cert]: any) => cert && Object.keys(cert).length > 0) : [];

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
      case 'system':
        return (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /></svg>);
      case 'validator':
        return (<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>);
      case 'network':
        return (<svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>);
      case 'chain':
        return (<svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" /></svg>);
      case 'ssl':
        return (<svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v-6m0 0V7m0 4h4m-4 0H8" /></svg>);
      default:
        return null;
    }
  };

  // Main return: all sections wrapped in a single fragment
  return (
    <React.Fragment>
      <div className="space-y-6">
        {/* Health Status (FIRST) */}
        {nodeData.health_status && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="health" />
              Health Status
            </h3>
            <div className="mb-2">Overall Status: <b>{nodeData.health_status.overall_status}</b></div>
            {Array.isArray(nodeData.health_status.issues) && nodeData.health_status.issues.length > 0 && (
              <div className="mb-2 text-xs text-red-600">Issues: {nodeData.health_status.issues.join(', ')}</div>
            )}
            {Array.isArray(nodeData.health_status.capabilities_working) && nodeData.health_status.capabilities_working.length > 0 && (
              <div className="mb-2 text-xs">Capabilities Working: {nodeData.health_status.capabilities_working.join(', ')}</div>
            )}
            {nodeData.health_status.endpoint_summary && (
              <div className="mb-2 text-xs">
                Endpoint Summary:
                <ul className="ml-2 list-disc">
                  {Object.entries(nodeData.health_status.endpoint_summary).map(([k, v]) => (
                    <li key={k}><span className="font-medium">{k.replace(/_/g, ' ')}:</span> {String(v)}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-2 text-xs">RPC Available: {nodeData.health_status.rpc_available}</div>
            <div className="mb-2 text-xs">gRPC Available: {nodeData.health_status.grpc_available}</div>
            <div className="mb-2 text-xs">Metrics Available: {nodeData.health_status.metrics_available}</div>
          </div>
        )}

        {/* --- Version Info (SECOND) --- */}
        {nodeData.version_info && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="version" />
              Version Info
            </h3>
            {renderKVTable(nodeData.version_info)}
          </div>
        )}

        {/* --- Endpoint Details --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SectionIcon name="endpoint" />
            Endpoint Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scanned Ports & Detected Services */}
            <div>
              <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />Scanned Ports</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {endpointDetails.scanned_ports?.map((port: number) => (
                  <span key={port} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-mono">{port}</span>
                ))}
              </div>
              <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />Detected Services</div>
              <div className="space-y-1">
                {endpointDetails.services && Object.entries(endpointDetails.services).map(([port, svc]: any) => (
                  svc.detected ? (
                    <div key={port} className="flex items-center gap-2 text-xs">
                      <span className="font-mono">Port {port}:</span>
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4" /></svg>
                      <span>Detected</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
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
          </div>
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
          {/* Docker API (only show if non-error) */}
          {dockerApiEntries.length > 0 && (
            <div className="mt-6">
              <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />Docker API</div>
              {dockerApiEntries.map(([port, info]: any) => (
                <div key={port} className="mb-2 text-xs">
                  <span className="font-mono">Port {port}:</span> <span>{JSON.stringify(info)}</span>
                </div>
              ))}
            </div>
          )}
          {/* Response Codes */}
          {endpointDetails.response_codes && Object.keys(endpointDetails.response_codes).length > 0 && (
            <div className="mt-6">
              <div className="font-medium mb-2 flex items-center gap-2"><SectionIcon name="service" />Response Codes</div>
              {renderKVTable(endpointDetails.response_codes)}
            </div>
          )}
        </div>
        {/* ...Service Versions removed... */}
        {/* --- Security Scan --- */}
        {securityScan && Object.keys(securityScan).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="security" />
              Security Scan
            </h3>
            {renderKVTable(securityScan)}
          </div>
        )}
        {/* --- System State --- */}
        {nodeData.system_state && Object.keys(nodeData.system_state).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="system" />
              System State
            </h3>
            {renderKVTable(nodeData.system_state)}
          </div>
        )}
        {/* --- Validator Info --- */}
        {nodeData.validator_info && Object.keys(nodeData.validator_info).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="validator" />
              Validator Info
            </h3>
            {renderKVTable(nodeData.validator_info)}
          </div>
        )}
        {/* --- Network Metrics --- */}
        {nodeData.network_metrics && Object.keys(nodeData.network_metrics).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="network" />
              Network Metrics
            </h3>
            {renderKVTable(nodeData.network_metrics)}
          </div>
        )}
        {/* --- Chain State --- */}
        {nodeData.chain_state && Object.keys(nodeData.chain_state).length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="chain" />
              Chain State
            </h3>
            {renderKVTable(nodeData.chain_state)}
          </div>
        )}
        {/* --- SSL Certificate Info --- */}
        {sslCertEntries.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="ssl" />
              SSL Certificate Info
            </h3>
            {sslCertEntries.map(([port, cert]: any) => (
              <div key={port} className="mb-4">
                <div className="font-semibold">Port {port}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><b>Subject:</b> {JSON.stringify(cert.subject)}</div>
                  <div><b>Issuer:</b> {JSON.stringify(cert.issuer)}</div>
                  <div><b>Version:</b> {cert.version ?? 'N/A'}</div>
                  <div><b>Serial Number:</b> {cert.serial_number ?? 'N/A'}</div>
                  <div><b>Not Before:</b> {cert.not_before ?? 'N/A'}</div>
                  <div><b>Not After:</b> {cert.not_after ?? 'N/A'}</div>
                  <div><b>Signature Algorithm:</b> {cert.signature_algorithm ?? 'N/A'}</div>
                </div>
              </div>
            ))}
            <div className="mt-2 text-xs">Certificate Count: {sslInfo.certificate_count ?? 'N/A'}</div>
          </div>
        )}
        {/* --- Service Version Info (only show if not errored) --- */}
        {serviceVersions.nmap_results && !serviceVersions.nmap_results.error && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SectionIcon name="service" />
              Service Version Info
            </h3>
            <div className="text-xs">Nmap Results: {JSON.stringify(serviceVersions.nmap_results)}</div>
          </div>
        )}
        {/* --- Security Scan Details --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SectionIcon name="security" />
            Security Scan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <div><b>Open Ports Count:</b> {securityScan.open_ports_count ?? 'N/A'}</div>
              <div><b>SSL Ports:</b> {Array.isArray(securityScan.ssl_ports) ? securityScan.ssl_ports.join(', ') : 'N/A'}</div>
              <div><b>Unencrypted Ports:</b> {Array.isArray(securityScan.unencrypted_ports) ? securityScan.unencrypted_ports.join(', ') : 'N/A'}</div>
            </div>
            <div>
              <div><b>Standard Ports:</b> {Array.isArray(securityScan.standard_ports) ? securityScan.standard_ports.join(', ') : 'N/A'}</div>
              <div><b>Non-Standard Ports:</b> {Array.isArray(securityScan.non_standard_ports) ? securityScan.non_standard_ports.join(', ') : 'N/A'}</div>
            </div>
          </div>
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