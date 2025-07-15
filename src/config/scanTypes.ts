// Scan orchestration configuration
export interface ScanTypeConfig {
  enabled: boolean;
  scan_type: string;
  config: {
    run: string;
    protocol?: boolean;
  };
  default: boolean;
  required: boolean;
  description: string;
  min_level?: number;
}

export interface ScanOrchestrationConfig {
  scan_orchestration: {
    available_scan_types: Record<string, ScanTypeConfig>;
  };
}

export const scanOrchestrationConfig: ScanOrchestrationConfig = {
  scan_orchestration: {
    available_scan_types: {
      web: {
        enabled: true,
        scan_type: "web",
        config: { run: "web" },
        default: true,
        required: true,
        description: "Web service detection and analysis (< 30s)"
      },
      whatweb: {
        enabled: true,
        scan_type: "whatweb",
        config: { run: "whatweb" },
        default: true,
        required: true,
        description: "WhatWeb technology detection (< 60s)"
      },
      geo: {
        enabled: true,
        scan_type: "geo",
        config: { run: "geo" },
        default: true,
        required: true,
        description: "Geolocation scanning (< 60s)"
      },
      ssl: {
        enabled: true,
        scan_type: "ssl",
        config: { run: "ssl_test" },
        default: true,
        required: true,
        description: "SSL/TLS security testing (< 60s)"
      },
      node_scan: {
        enabled: true,
        scan_type: "node_scan",
        config: { run: "node_scan", protocol: true },
        default: true,
        required: true,
        description: "Comprehensive node infrastructure scan (< 60s)"
      },
      compliance: {
        enabled: false,
        scan_type: "compliance",
        min_level: 1,
        config: { run: "compliance", protocol: true },
        default: false,
        required: false,
        description: "Level 1 compliance scanning (< 2 mins)"
      },
      protocol_scan: {
        enabled: false,
        scan_type: "protocol_scan",
        min_level: 2,
        config: { run: "protocol_scan", protocol: true },
        default: false,
        required: false,
        description: "Level 2 compliance scanning"
      },
      deep_discovery: {
        enabled: true,
        scan_type: "deep_discovery",
        config: { run: "deep_discovery" },
        default: false,
        required: false,
        description: "Deep discovery scan for comprehensive node analysis (< 3 mins)"
      }
    }
  }
};

// Helper function to get available scanners (enabled)
export const getAvailableScanners = () => {
  const scanTypes = scanOrchestrationConfig.scan_orchestration.available_scan_types;
  
  return Object.entries(scanTypes)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({
      id: key,
      label: formatScannerLabel(key),
      description: config.description,
      default: config.default,
      required: config.required,
      minLevel: config.min_level
    }));
};

// Helper function to get default selected scanners
export const getDefaultScanners = () => {
  // Return empty array - no scans selected by default
  return [];
};

// Helper function to format scanner labels
const formatScannerLabel = (scanType: string): string => {
  const labelMap: Record<string, string> = {
    web: 'Web Scanner',
    whatweb: 'WhatWeb Scanner',
    geo: 'Geo Scanner',
    ssl: 'SSL/TLS Scanner',
    node_scan: 'Node Scanner',
    compliance: 'Compliance Scanner (Level 1)',
    protocol_scan: 'Protocol Scanner (Level 2)',
    deep_discovery: 'Deep Discovery Scanner'
  };
  
  return labelMap[scanType] || scanType.charAt(0).toUpperCase() + scanType.slice(1);
};