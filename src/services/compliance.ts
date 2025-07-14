import type { 
  ComplianceFramework, 
  ComplianceControl, 
  ComplianceTrend, 
  ComplianceScanRequest,
  ComplianceScanResponse 
} from '@/types/compliance';

// Mock data
export const mockFrameworks: ComplianceFramework[] = [
  {
    id: "soc2",
    name: "SOC2 Type II",
    compliance: 87,
    trend: "+5%",
    lastScan: "2025-07-12",
    summary: {
      passed: 45,
      failed: 8,
      critical: 2,
      nextAudit: "2025-10-01"
    },
    description: "Service Organization Control 2 Type II certification for security, availability, processing integrity, confidentiality, and privacy.",
    version: "2017",
    category: "Security"
  },
  {
    id: "iso27001",
    name: "ISO 27001",
    compliance: 92,
    trend: "0%",
    lastScan: "2025-07-12",
    summary: {
      passed: 52,
      failed: 4,
      critical: 1,
      nextAudit: "2025-09-15"
    },
    description: "International standard for information security management systems.",
    version: "2013",
    category: "Security"
  },
  {
    id: "mica",
    name: "MiCA",
    compliance: 78,
    trend: "-3%",
    lastScan: "2025-07-12",
    summary: {
      passed: 38,
      failed: 12,
      critical: 3,
      nextAudit: "2025-08-20"
    },
    description: "Markets in Crypto-Assets regulation framework for EU compliance.",
    version: "2023",
    category: "Regulatory"
  }
];

export const mockFailedControls: ComplianceControl[] = [
  {
    framework: "SOC2",
    controlId: "CC6.1",
    severity: "CRITICAL",
    description: "Only required ports should be open",
    status: "FAILED",
    evidence: {
      timestamp: "2025-07-12T10:30:00Z",
      ports: [27017, 26656, 26657],
      source: "validator1.pgdn.net"
    },
    remediation: [
      "Block port 27017 using firewall rules",
      "Confirm P2P, RPC, metrics ports only are exposed"
    ],
    category: "Access Control",
    subcategory: "Network Security"
  },
  {
    framework: "ISO27001",
    controlId: "A.12.6",
    severity: "HIGH",
    description: "Outdated node software",
    status: "FAILED",
    evidence: {
      timestamp: "2025-07-12T11:45:00Z",
      currentVersion: "v1.1.2",
      latestVersion: "v1.3.0",
      affectedNodes: ["validator3.pgdn.net"]
    },
    remediation: ["Upgrade to v1.3.0 and re-run scan"],
    category: "Asset Management",
    subcategory: "Software Updates"
  },
  {
    framework: "MiCA",
    controlId: "MICA-4.2",
    severity: "MEDIUM",
    description: "Insufficient audit trail for transaction monitoring",
    status: "FAILED",
    evidence: {
      timestamp: "2025-07-12T14:20:00Z",
      missingLogs: ["transaction_events", "user_actions"],
      retentionPeriod: "30 days"
    },
    remediation: [
      "Implement comprehensive audit logging",
      "Extend log retention to 7 years as per MiCA requirements"
    ],
    category: "Audit & Compliance",
    subcategory: "Logging"
  }
];

export const mockTrends: ComplianceTrend[] = [
  { date: '2025-06-01', compliance: 78, framework: 'soc2' },
  { date: '2025-07-01', compliance: 83, framework: 'soc2' },
  { date: '2025-07-12', compliance: 87, framework: 'soc2' },
  { date: '2025-06-01', compliance: 90, framework: 'iso27001' },
  { date: '2025-07-01', compliance: 91, framework: 'iso27001' },
  { date: '2025-07-12', compliance: 92, framework: 'iso27001' },
  { date: '2025-06-01', compliance: 81, framework: 'mica' },
  { date: '2025-07-01', compliance: 80, framework: 'mica' },
  { date: '2025-07-12', compliance: 78, framework: 'mica' }
];

// API functions
export const complianceApi = {
  // Get compliance summary for all frameworks
  async getComplianceSummary(): Promise<ComplianceFramework[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFrameworks;
  },

  // Get controls for a specific framework
  async getFrameworkControls(frameworkId: string): Promise<ComplianceControl[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFailedControls.filter(control => 
      control.framework.toLowerCase() === frameworkId.toLowerCase()
    );
  },

  // Get compliance trends for a framework
  async getComplianceTrends(frameworkId: string): Promise<ComplianceTrend[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTrends.filter(trend => trend.framework === frameworkId);
  },

  // Trigger a compliance scan
  async triggerComplianceScan(request: ComplianceScanRequest): Promise<ComplianceScanResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      scanId: `scan_${Date.now()}`,
      status: 'queued',
      framework: request.framework,
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
    };
  },

  // Get scan status
  async getScanStatus(scanId: string): Promise<ComplianceScanResponse> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate progress
    const progress = Math.min(85, Math.floor(Math.random() * 100));
    const status = progress >= 100 ? 'completed' : 'running';
    
    return {
      scanId,
      status,
      framework: 'soc2',
      progress,
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(),
      results: status === 'completed' ? {
        framework: 'soc2',
        generatedAt: new Date().toISOString(),
        summary: {
          totalControls: 53,
          passedControls: 45,
          failedControls: 8,
          criticalFailures: 2,
          compliancePercentage: 87
        },
        controls: mockFailedControls,
        recommendations: [
          "Address critical port security issues immediately",
          "Update node software to latest stable version",
          "Implement comprehensive audit logging"
        ]
      } : undefined
    };
  },

  // Export compliance report
  async exportReport(frameworkId: string, format: 'pdf' | 'json'): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reportData = {
      framework: frameworkId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalControls: 53,
        passedControls: 45,
        failedControls: 8,
        criticalFailures: 2,
        compliancePercentage: 87
      },
      controls: mockFailedControls,
      trends: mockTrends.filter(t => t.framework === frameworkId)
    };

    if (format === 'json') {
      return new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
    } else {
      // Mock PDF - in real implementation, this would generate actual PDF
      return new Blob(['Mock PDF content'], { 
        type: 'application/pdf' 
      });
    }
  },

  // Upload compliance template
  async uploadTemplate(template: File): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation
    if (template.size > 1024 * 1024) { // 1MB limit
      return { success: false, message: 'Template file too large' };
    }
    
    return { success: true, message: 'Template uploaded successfully' };
  }
}; 