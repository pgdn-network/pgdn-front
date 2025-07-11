import React, { useMemo } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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

// 7. Fallback for unknown scan types
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