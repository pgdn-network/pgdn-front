export interface ComplianceFramework {
  id: string;
  name: string;
  compliance: number;
  trend: string;
  lastScan: string;
  summary?: {
    passed: number;
    failed: number;
    critical: number;
    nextAudit?: string;
  };
  description?: string;
  version?: string;
  category?: string;
}

export interface ComplianceControl {
  framework: string;
  controlId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'NOT_APPLICABLE';
  evidence?: {
    timestamp: string;
    [key: string]: any;
  };
  remediation?: string[];
  category?: string;
  subcategory?: string;
  references?: string[];
  lastChecked?: string;
}

export interface ComplianceTrend {
  date: string;
  compliance: number;
  framework: string;
}

export interface ComplianceTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  frameworks: ComplianceFramework[];
  controls: ComplianceControl[];
  metadata?: {
    author?: string;
    created?: string;
    updated?: string;
    tags?: string[];
  };
}

export interface ComplianceReport {
  framework: string;
  generatedAt: string;
  summary: {
    totalControls: number;
    passedControls: number;
    failedControls: number;
    criticalFailures: number;
    compliancePercentage: number;
  };
  controls: ComplianceControl[];
  trends?: ComplianceTrend[];
  recommendations?: string[];
}

export interface ComplianceScanRequest {
  framework: string;
  nodeUuid?: string;
  organizationUuid?: string;
  scanLevel?: 'basic' | 'comprehensive' | 'audit';
  includeEvidence?: boolean;
}

export interface ComplianceScanResponse {
  scanId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  framework: string;
  progress?: number;
  estimatedCompletion?: string;
  results?: ComplianceReport;
} 