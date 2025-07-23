import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Shield,
  Brain,
  Zap,
  DollarSign,
  Upload
} from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NodeApiService } from '@/api/nodes';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { NodeReport } from '@/types/node';

const OrgNodeReportDetail: React.FC = () => {
  const { slug, nodeId, reportUuid } = useParams<{ slug: string; nodeId: string; reportUuid: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { addNotification } = useNotifications();
  const [report, setReport] = useState<NodeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedBlockchain, setSelectedBlockchain] = useState<'sui' | 'zksync'>('sui');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishes, setPublishes] = useState<any[]>([]);

  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  const getSeverityColor = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getExploitationEaseVariant = (ease?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!ease) return 'default';
    
    switch (ease.toLowerCase()) {
      case 'very easy':
      case 'easy':
        return 'destructive';
      case 'medium':
      case 'moderate':
        return 'outline';
      case 'hard':
      case 'very hard':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleOpenPublishModal = () => {
    setSelectedBlockchain('sui');
    setIsPublishModalOpen(true);
  };

  const handleClosePublishModal = () => {
    setIsPublishModalOpen(false);
    setSelectedBlockchain('sui');
  };

  const handlePublishReport = async () => {
    if (!report || !organizationUuid || !nodeId || !reportUuid) return;
    
    setIsPublishing(true);
    
    try {
      await NodeApiService.publishNodeReport(
        organizationUuid,
        nodeId,
        reportUuid,
        selectedBlockchain
      );
      
      addNotification({
        type: 'success',
        title: 'Report Publishing Started',
        message: `Your report is being published to ${selectedBlockchain.toUpperCase()}. This may take up to a minute.`,
        duration: 10000
      });
      
      handleClosePublishModal();
      
      // Refresh publishes after publishing
      try {
        const publishData = await NodeApiService.getNodeLedgerPublishes(
          organizationUuid, 
          nodeId, 
          reportUuid
        );
        setPublishes(publishData);
      } catch (refreshErr) {
        console.error('Error refreshing publishes:', refreshErr);
      }
    } catch (err: any) {
      let errorMessage = 'Could not publish report. Please try again.';
      
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Publishing Failed',
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      if (!organizationUuid || !nodeId || !reportUuid) return;

      setLoading(true);
      setError(null);

      try {
        const data = await NodeApiService.getNodeReport(organizationUuid, nodeId, reportUuid);
        setReport(data);
        
        // Fetch publishes for this report
        try {
          const publishData = await NodeApiService.getNodeLedgerPublishes(
            organizationUuid, 
            nodeId, 
            reportUuid
          );
          setPublishes(publishData);
        } catch (publishErr) {
          console.error('Error fetching publishes:', publishErr);
          // Don't fail the whole component if publishes can't be loaded
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [organizationUuid, nodeId, reportUuid]);

  if (orgsLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {error || 'Report not found'}
        </h3>
        <Link to={`/organizations/${slug}/nodes/${nodeId}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Node
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to={`/organizations/${slug}/nodes/${nodeId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Node
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
          <p className="text-muted-foreground mt-1">{report.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{report.report_type}</Badge>
          {report.report_type === 'security_analysis' && (
            publishes.length > 0 ? (
              // If published, show a link to the ledger publish page within the app
              <Link
                to={`/organizations/${slug}/nodes/${nodeId}/ledger`}
                className="inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm font-medium text-green-700 border-green-300 bg-green-50 hover:bg-green-100 transition"
              >
                <Upload className="h-4 w-4" />
                View Ledger Publish
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPublishModal}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Publish
              </Button>
            )
          )}
        </div>
      </div>

      {/* Report Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center rounded-lg">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center rounded-lg">
              <Activity className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Session ID</p>
              <p className="font-mono text-xs">{report.session_id}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center rounded-lg">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="font-medium">
                {report.risk_score !== null ? `${report.risk_score}/20` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* New Security Analysis Report Rendering */}
      {report.report_type === 'security_analysis' && report.report_data?.report && (
        <div className="space-y-6">
          {/* Summary Section (from summary or summary_text) */}
          {(report.report_data.report.summary_text || report.report_data.report.summary) && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">Summary</h3>
              </div>
              {report.report_data.report.summary_text ? (
                <p className="text-sm leading-relaxed">{report.report_data.report.summary_text}</p>
              ) : report.report_data.report.summary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium">Security Score</p>
                      <p className="text-2xl font-bold text-primary">{report.report_data.report.summary.score}/100</p>
                      <Badge 
                        variant={
                          report.report_data.report.summary.risk_level === 'Low' ? 'default' : 
                          report.report_data.report.summary.risk_level === 'Medium' ? 'outline' : 'destructive'
                        }
                        className="mt-2"
                      >
                        {report.report_data.report.summary.risk_level} Risk
                      </Badge>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium">Node Address</p>
                      <p className="text-sm font-mono break-all">{report.report_data.report.summary.address}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground font-medium">Protocol</p>
                      <p className="text-sm font-medium uppercase">{report.report_data.report.summary.protocol}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Assessment Notes</p>
                    <p className="text-sm leading-relaxed">{report.report_data.report.summary.assessment_notes}</p>
                  </div>
                  {report.report_data.report.summary.scan_date && (
                    <div className="text-xs text-muted-foreground">
                      Scan Date: {new Date(report.report_data.report.summary.scan_date).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          )}

          {/* Latency Information */}
          {report.report_data.report.latency && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">Network Performance</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Average Latency: {report.report_data.report.latency.average_ms}ms
                  </p>
                </div>
                {report.report_data.report.latency.critical_ports && report.report_data.report.latency.critical_ports.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Critical Latency Issues</p>
                    {report.report_data.report.latency.critical_ports.map((port: any, idx: number) => (
                      <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-400">{port.note}</p>
                        {port.port !== "unspecified" && (
                          <p className="text-xs text-red-600 dark:text-red-500">Port: {port.port}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* gRPC Information */}
          {report.report_data.report.grpc && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">gRPC Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={report.report_data.report.grpc.status === 'active' ? 'default' : 'secondary'}>
                    {report.report_data.report.grpc.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.report_data.report.grpc.notes}</p>
                {report.report_data.report.grpc.exposed_ports && report.report_data.report.grpc.exposed_ports.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mt-2">Exposed Ports:</p>
                    <ul className="list-disc list-inside">
                      {report.report_data.report.grpc.exposed_ports.map((port: any, idx: number) => (
                        <li key={idx} className="text-sm">{JSON.stringify(port)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Key Findings (object or array) */}
          {report.report_data.report.key_findings && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="text-lg font-semibold text-foreground">Key Findings</h3>
              </div>
              <ul className="list-disc list-inside space-y-2">
                {/* If key_findings is an object with critical/moderate/informational arrays */}
                {typeof report.report_data.report.key_findings === 'object' && !Array.isArray(report.report_data.report.key_findings) && (
                  <>
                    {['critical', 'moderate', 'informational'].map((severity) => {
                      const arr = (report.report_data?.report?.key_findings as any)?.[severity];
                      if (Array.isArray(arr)) {
                        return arr.map((finding: any, idx: number) => (
                          <li key={`${severity}-${idx}`} className={`text-sm ${severity === 'critical' ? 'text-red-600' : severity === 'moderate' ? 'text-orange-600' : 'text-blue-600'}`}>
                            <span className="font-bold">{severity.charAt(0).toUpperCase() + severity.slice(1)}:</span> {finding.issue} - {finding.description}
                            {finding.recommended_fix && (
                              <span className="ml-2 text-xs text-muted-foreground">Fix: {finding.recommended_fix}</span>
                            )}
                          </li>
                        ));
                      }
                      return null;
                    })}
                  </>
                )}
                {/* If key_findings is a flat array of strings */}
                {Array.isArray(report.report_data.report.key_findings) && report.report_data.report.key_findings.map((finding: any, idx: number) => (
                  <li key={idx} className="text-sm">{typeof finding === 'string' ? finding : JSON.stringify(finding)}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Open Ports */}
          {Array.isArray((report.report_data.report as any).open_ports) && (report.report_data.report as any).open_ports.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">Open Ports</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(report.report_data.report as any).open_ports.map((port: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <span className="font-mono">{port.port}</span>: {port.service} - {port.notes}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* TLS Issues */}
          {Array.isArray((report.report_data.report as any).tls_issues) && (report.report_data.report as any).tls_issues.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-lg font-semibold text-foreground">TLS Issues</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(report.report_data.report as any).tls_issues.map((issue: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <span className="font-bold">{issue.error}</span>: {issue.impact}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Compliance Flags */}
          {Array.isArray((report.report_data.report as any).compliance_flags) && (report.report_data.report as any).compliance_flags.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">Compliance Flags</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(report.report_data.report as any).compliance_flags.map((flag: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <span className="font-bold">{flag.flag}</span>: {flag.evidence}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommended Fixes */}
          {Array.isArray((report.report_data.report as any).recommended_fixes) && (report.report_data.report as any).recommended_fixes.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">Recommended Fixes</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {(report.report_data.report as any).recommended_fixes.map((fix: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <span className="font-bold">{fix.action}</span> - Priority: {fix.priority}, Estimate: {fix.time_estimate}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Report Metadata removed as requested */}
        </div>
      )}

      {/* Network Report Data */}
      {report.report_type === 'network' && report.report_data?.report && (
        <div className="space-y-6">
          {/* Network Summary */}
          {report.report_data.report.node_summary && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">Node Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Hostname</p>
                  <p className="text-sm font-mono">{report.report_data.report.node_summary.ip_hostname}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Role</p>
                  <p className="text-sm capitalize">{report.report_data.report.node_summary.likely_role?.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Protocol</p>
                  <p className="text-sm">{report.report_data.report.node_summary.likely_protocol}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Health Status</p>
                  <Badge variant={report.report_data.report.node_summary.health_status === 'healthy' ? 'default' : 'destructive'}>
                    {report.report_data.report.node_summary.health_status}
                  </Badge>
                </div>
              </div>
              
              {report.report_data.report.node_summary.discovery_confidence && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm dark:text-blue-200">
                    <span className="font-medium">Discovery Confidence:</span> {Math.round(report.report_data.report.node_summary.discovery_confidence * 100)}%
                  </p>
                </div>
              )}

              {report.report_data.report.node_summary.discovered_capabilities && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Discovered Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {report.report_data.report.node_summary.discovered_capabilities.map((capability: string, index: number) => (
                      <Badge key={index} variant="default" className="uppercase tracking-wide text-xs font-semibold">{capability.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Key Findings */}
          {report.report_data.report.key_findings && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">Key Findings</h3>
              </div>
              <ul className="space-y-2">
                {Array.isArray(report.report_data.report.key_findings) ? 
                  report.report_data.report.key_findings.map((finding: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{finding}</span>
                    </li>
                  )) : (
                    // Handle object-based key_findings (security analysis format)
                    ['critical', 'moderate', 'informational'].map((severity) => {
                      const findings = (report.report_data?.report?.key_findings as any)?.[severity];
                      if (Array.isArray(findings) && findings.length > 0) {
                        return findings.map((finding: any, idx: number) => (
                          <li key={`${severity}-${idx}`} className="flex items-start gap-2">
                            <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                              severity === 'critical' ? 'text-red-500' : 
                              severity === 'moderate' ? 'text-orange-500' : 'text-blue-500'
                            }`} />
                            <div className="text-sm">
                              <span className={`font-medium ${
                                severity === 'critical' ? 'text-red-600' : 
                                severity === 'moderate' ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}:
                              </span>
                              <span className="ml-2">{finding.issue}</span>
                              {finding.description && (
                                <div className="text-muted-foreground mt-1">{finding.description}</div>
                              )}
                            </div>
                          </li>
                        ));
                      }
                      return null;
                    })
                  )
                }
              </ul>
            </Card>
          )}

          {/* Analyst Commentary */}
          {report.report_data.report.analyst_commentary && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">Analyst Commentary</h3>
              </div>
              <div className="space-y-4">
                {report.report_data.report.analyst_commentary.tldr && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-400 mb-1">TL;DR</p>
                    <p className="text-sm dark:text-purple-200">{report.report_data.report.analyst_commentary.tldr}</p>
                  </div>
                )}
                {report.report_data.report.analyst_commentary.business_impact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Business Impact</p>
                    <p className="text-sm">{report.report_data.report.analyst_commentary.business_impact}</p>
                  </div>
                )}
                {report.report_data.report.analyst_commentary.next_steps && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Next Steps</p>
                    <p className="text-sm">{report.report_data.report.analyst_commentary.next_steps}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Availability and APIs */}
          {report.report_data.report.availability_and_apis && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">API Availability</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.report_data.report.availability_and_apis).map(([api, status]: [string, any]) => (
                  <div key={api} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium capitalize">{api.replace('_', ' ')}</span>
                    <Badge variant={status === 'available' ? 'default' : 'destructive'}>
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Observations */}
          {report.report_data.report.security_observations && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-red-500" />
                <h3 className="text-lg font-semibold text-foreground">Security Observations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.report_data.report.security_observations.concerns && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Security Concerns</p>
                    <ul className="space-y-1">
                      {report.report_data.report.security_observations.concerns.map((concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.report_data.report.security_observations.positives && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-2">Security Positives</p>
                    <ul className="space-y-1">
                      {report.report_data.report.security_observations.positives.map((positive: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{positive}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recommended Actions */}
          {report.report_data.report.recommended_actions && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">Recommended Actions</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(report.report_data.report.recommended_actions).map(([priority, actions]: [string, any]) => {
                  if (!actions || actions.length === 0) return null;
                  
                  const priorityColors = {
                    critical: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
                    high: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20',
                    medium: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
                    low: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
                    optional: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20'
                  };

                  return (
                    <div key={priority} className={`border rounded-lg p-4 ${priorityColors[priority as keyof typeof priorityColors] || 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20'}`}>
                      <h4 className="font-medium text-foreground mb-2 capitalize">{priority} Priority</h4>
                      <ul className="space-y-1">
                        {actions.map((action: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Summary Text */}
          {report.report_data.report.summary_text && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-foreground">Summary</h3>
              </div>
              <p className="text-sm leading-relaxed">{report.report_data.report.summary_text}</p>
            </Card>
          )}
        </div>
      )}

      {/* Comprehensive Report Data */}
      {report.report_type !== 'network' && report.report_data?.report && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {report.report_data.report.executive_summary && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">Executive Summary</h3>
              </div>
              <div className="space-y-4">
                {report.report_data.report.executive_summary.tldr && (
                  <p className="text-sm leading-relaxed">{report.report_data.report.executive_summary.tldr}</p>
                )}
                {report.report_data.report.executive_summary.overview && (
                  <p className="text-sm leading-relaxed">{report.report_data.report.executive_summary.overview}</p>
                )}
                
                {/* Show metrics in cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Total Vulnerabilities</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">
                      {report.report_data.report.executive_summary.total_vulnerabilities || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Critical</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">
                      {report.report_data.report.executive_summary.critical_vulnerabilities || 0}
                    </p>
                  </div>
                  <div className="bg-muted border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Risk Level</p>
                    <p className={`text-lg font-bold ${
                      report.report_data.report.executive_summary.overall_risk_level === 'Low' ? 'text-green-600 dark:text-green-400' :
                      report.report_data.report.executive_summary.overall_risk_level === 'Medium' ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {report.report_data.report.executive_summary.overall_risk_level}
                    </p>
                  </div>
                </div>

                {report.report_data.report.executive_summary.budget_needed && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm dark:text-blue-200">
                      <span className="font-medium">Budget Needed:</span> {report.report_data.report.executive_summary.budget_needed}
                    </p>
                  </div>
                )}
                
                {report.report_data.report.executive_summary.business_risk && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <p className="text-sm dark:text-orange-200">
                      <span className="font-medium">Business Risk:</span> {report.report_data.report.executive_summary.business_risk}
                    </p>
                  </div>
                )}

                {report.report_data.report.executive_summary.key_findings && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Key Findings</p>
                    <ul className="list-disc list-inside space-y-1">
                      {report.report_data.report.executive_summary.key_findings.map((finding: string, index: number) => (
                        <li key={index} className="text-sm">{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.report_data.report.executive_summary.risk_assessment && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Risk Assessment</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{report.report_data.report.executive_summary.risk_assessment}</p>
                  </div>
                )}
                {report.report_data.report.executive_summary.recommendations && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Recommendations</p>
                    <ul className="list-disc list-inside space-y-1">
                      {report.report_data.report.executive_summary.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Validator Summary */}
          {report.report_data.report.validator_summary && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">Validator Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Address</p>
                    <p className="text-sm font-mono">{report.report_data.report.validator_summary.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Protocol</p>
                    <p className="text-sm">{report.report_data.report.validator_summary.protocol}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Risk Score</p>
                    <p className="text-sm font-bold">{report.report_data.report.validator_summary.overall_risk_score}/100</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Scan Date</p>
                    <p className="text-sm">{new Date(report.report_data.report.validator_summary.scan_date).toLocaleString()}</p>
                  </div>
                </div>
                
                {report.report_data.report.validator_summary.node_id && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Node ID:</span> 
                      <span className="font-mono text-xs ml-2">{report.report_data.report.validator_summary.node_id}</span>
                    </p>
                  </div>
                )}
                
                {report.report_data.report.validator_summary.maya_risk_translation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm dark:text-blue-200">
                      <span className="font-medium">Maya's Assessment:</span> {report.report_data.report.validator_summary.maya_risk_translation}
                    </p>
                  </div>
                )}

                {report.report_data.report.validator_summary.node_details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.report_data.report.validator_summary.node_details.name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Node Name</p>
                        <p className="text-sm">{report.report_data.report.validator_summary.node_details.name}</p>
                      </div>
                    )}
                    {report.report_data.report.validator_summary.node_details.address && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                        <p className="text-sm font-mono">{report.report_data.report.validator_summary.node_details.address}</p>
                      </div>
                    )}
                    {report.report_data.report.validator_summary.node_details.network && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Network</p>
                        <p className="text-sm">{report.report_data.report.validator_summary.node_details.network}</p>
                      </div>
                    )}
                    {report.report_data.report.validator_summary.node_details.status && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                        <Badge variant="outline">{report.report_data.report.validator_summary.node_details.status}</Badge>
                      </div>
                    )}
                  </div>
                )}
                {report.report_data.report.validator_summary.performance_metrics && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Performance Metrics</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.report_data.report.validator_summary.performance_metrics.uptime && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Uptime</p>
                          <p className="text-sm font-bold text-green-700 dark:text-green-300">{report.report_data.report.validator_summary.performance_metrics.uptime}</p>
                        </div>
                      )}
                      {report.report_data.report.validator_summary.performance_metrics.response_time && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Response Time</p>
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{report.report_data.report.validator_summary.performance_metrics.response_time}</p>
                        </div>
                      )}
                      {report.report_data.report.validator_summary.performance_metrics.throughput && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Throughput</p>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">{report.report_data.report.validator_summary.performance_metrics.throughput}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Maya Assessment */}
          {report.report_data.report.maya_assessment && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">Maya's Assessment</h3>
              </div>
              <div className="space-y-4">
                {report.report_data.report.maya_assessment.infrastructure_headline && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <p className="text-sm font-medium dark:text-purple-200">{report.report_data.report.maya_assessment.infrastructure_headline}</p>
                  </div>
                )}
                <div className="grid gap-3">
                  {report.report_data.report.maya_assessment.economic_impact && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Economic Impact</p>
                      <p className="text-sm">{report.report_data.report.maya_assessment.economic_impact}</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.compliance_status && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Compliance Status</p>
                      <p className="text-sm">{report.report_data.report.maya_assessment.compliance_status}</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.ai_agent_readiness && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">AI Agent Readiness</p>
                      <p className="text-sm">{report.report_data.report.maya_assessment.ai_agent_readiness}</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.overall_score && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-400 mb-1">Overall Score</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{report.report_data.report.maya_assessment.overall_score}/100</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.security_posture && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Security Posture</p>
                      <p className="text-sm">{report.report_data.report.maya_assessment.security_posture}</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.operational_readiness && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Operational Readiness</p>
                      <p className="text-sm">{report.report_data.report.maya_assessment.operational_readiness}</p>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.risk_factors && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Risk Factors</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report.report_data.report.maya_assessment.risk_factors.map((factor: string, index: number) => (
                          <li key={index} className="text-sm text-red-600">{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.strengths && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Strengths</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report.report_data.report.maya_assessment.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-green-600">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.report_data.report.maya_assessment.improvement_areas && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Improvement Areas</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report.report_data.report.maya_assessment.improvement_areas.map((area: string, index: number) => (
                          <li key={index} className="text-sm text-orange-600">{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Security Findings */}
          {report.report_data.report.security_findings && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-lg font-semibold text-foreground">Security Findings</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(report.report_data.report.security_findings).map(([category, findings]: [string, any]) => {
                  if (!findings || !Array.isArray(findings) || findings.length === 0) return null;
                  
                  return (
                    <div key={category} className="border border-muted rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 capitalize">
                        {category.replace(/_/g, ' ')}
                      </h4>
                      <div className="space-y-3">
                        {findings.map((finding: any, index: number) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm">{finding.issue || finding.type || finding.title}</h5>
                              {finding.severity && (
                                <Badge variant={getSeverityColor(finding.severity)}>
                                  {finding.severity}
                                </Badge>
                              )}
                              {finding.exploitation_ease && (
                                <Badge variant={getExploitationEaseVariant(finding.exploitation_ease)}>
                                  {finding.exploitation_ease}
                                </Badge>
                              )}
                            </div>
                            {finding.evidence && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Evidence</p>
                                <p className="text-sm bg-gray-100 dark:bg-gray-800 dark:text-gray-200 p-2 rounded">{finding.evidence}</p>
                              </div>
                            )}
                            {finding.maya_analysis && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Maya's Analysis</p>
                                <p className="text-sm">{finding.maya_analysis}</p>
                              </div>
                            )}
                            {finding.description && (
                              <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                            )}
                            {finding.impact && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Impact</p>
                                <p className="text-sm">{finding.impact}</p>
                              </div>
                            )}
                            {finding.recommendation && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                                <p className="text-sm">{finding.recommendation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Show message if no findings */}
                {Object.keys(report.report_data.report.security_findings).length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No security findings in this category</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Maya's Action Plan */}
          {report.report_data.report.mayas_action_plan && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">Maya's Action Plan</h3>
              </div>
              <div className="space-y-4">
                {report.report_data.report.mayas_action_plan.summary && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm dark:text-yellow-200">{report.report_data.report.mayas_action_plan.summary}</p>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.immediate_infrastructure_fixes && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Immediate Infrastructure Fixes</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.immediate_infrastructure_fixes.map((action: any, index: number) => (
                        <div key={index} className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium dark:text-red-200">{action.action}</p>
                            <Badge variant="destructive">Priority {action.priority}</Badge>
                          </div>
                          {action.rationale && (
                            <p className="text-xs text-muted-foreground mb-2">{action.rationale}</p>
                          )}
                          {action.time_estimate && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">Estimated Time: {action.time_estimate}</p>
                          )}
                          {action.commands && action.commands.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Commands:</p>
                              {action.commands.map((cmd: string, cmdIndex: number) => (
                                <code key={cmdIndex} className="block text-xs bg-gray-800 text-gray-100 p-2 rounded font-mono">
                                  {cmd}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.this_weekend && report.report_data.report.mayas_action_plan.this_weekend.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">This Weekend</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.this_weekend.map((task: any, index: number) => (
                        <div key={index} className="border border-orange-200 dark:border-orange-800 rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                          <p className="text-sm dark:text-orange-200">{task.action || task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.next_sprint && report.report_data.report.mayas_action_plan.next_sprint.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Next Sprint</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.next_sprint.map((task: any, index: number) => (
                        <div key={index} className="border border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                          <p className="text-sm dark:text-blue-200">{task.action || task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.immediate_actions && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Immediate Actions</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.immediate_actions.map((action: string, index: number) => (
                        <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                          <p className="text-sm">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.short_term_goals && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Short Term Goals</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.short_term_goals.map((goal: string, index: number) => (
                        <div key={index} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                          <p className="text-sm">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.long_term_strategy && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Long Term Strategy</h4>
                    <div className="space-y-2">
                      {report.report_data.report.mayas_action_plan.long_term_strategy.map((strategy: string, index: number) => (
                        <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                          <p className="text-sm">{strategy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.timeline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Timeline</p>
                    <p className="text-sm text-yellow-700">{report.report_data.report.mayas_action_plan.timeline}</p>
                  </div>
                )}
                {report.report_data.report.mayas_action_plan.resources_required && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Resources Required</p>
                    <ul className="list-disc list-inside space-y-1">
                      {report.report_data.report.mayas_action_plan.resources_required.map((resource: string, index: number) => (
                        <li key={index} className="text-sm">{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Investor Summary */}
          {report.report_data.report.investor_summary && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">Investor Summary</h3>
              </div>
              <div className="space-y-3">
                {report.report_data.report.investor_summary.revenue_impact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Revenue Impact</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.revenue_impact}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.competitive_moat && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Competitive Moat</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.competitive_moat}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.market_opportunity && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Market Opportunity</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.market_opportunity}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.investment_thesis && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Investment Thesis</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.investment_thesis}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.risk_return_profile && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Risk Return Profile</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.risk_return_profile}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.competitive_advantages && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Competitive Advantages</p>
                    <ul className="list-disc list-inside space-y-1">
                      {report.report_data.report.investor_summary.competitive_advantages.map((advantage: string, index: number) => (
                        <li key={index} className="text-sm">{advantage}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.report_data.report.investor_summary.market_position && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Market Position</p>
                    <p className="text-sm">{report.report_data.report.investor_summary.market_position}</p>
                  </div>
                )}
                {report.report_data.report.investor_summary.financial_projections && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Financial Projections</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      {report.report_data.report.investor_summary.financial_projections.expected_returns && (
                        <p className="text-sm">
                          <span className="font-medium">Expected Returns:</span> {report.report_data.report.investor_summary.financial_projections.expected_returns}
                        </p>
                      )}
                      {report.report_data.report.investor_summary.financial_projections.staking_rewards && (
                        <p className="text-sm">
                          <span className="font-medium">Staking Rewards:</span> {report.report_data.report.investor_summary.financial_projections.staking_rewards}
                        </p>
                      )}
                      {report.report_data.report.investor_summary.financial_projections.growth_potential && (
                        <p className="text-sm">
                          <span className="font-medium">Growth Potential:</span> {report.report_data.report.investor_summary.financial_projections.growth_potential}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* DePIN Economics */}
          {report.report_data.report.depin_economics && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">DePIN Economics</h3>
              </div>
              <div className="space-y-3">
                {report.report_data.report.depin_economics.validator_reputation && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Validator Reputation</p>
                    <p className="text-sm">{report.report_data.report.depin_economics.validator_reputation}</p>
                  </div>
                )}
                {report.report_data.report.depin_economics.token_incentive_impact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Token Incentive Impact</p>
                    <p className="text-sm">{report.report_data.report.depin_economics.token_incentive_impact}</p>
                  </div>
                )}
                {report.report_data.report.depin_economics.network_effect_implications && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Network Effect Implications</p>
                    <p className="text-sm">{report.report_data.report.depin_economics.network_effect_implications}</p>
                  </div>
                )}
                {report.report_data.report.depin_economics.network_value && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Network Value</p>
                    <p className="text-sm">{report.report_data.report.depin_economics.network_value}</p>
                  </div>
                )}
                {report.report_data.report.depin_economics.token_economics && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Token Economics</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      {report.report_data.report.depin_economics.token_economics.token_supply && (
                        <p className="text-sm">
                          <span className="font-medium">Token Supply:</span> {report.report_data.report.depin_economics.token_economics.token_supply}
                        </p>
                      )}
                      {report.report_data.report.depin_economics.token_economics.inflation_rate && (
                        <p className="text-sm">
                          <span className="font-medium">Inflation Rate:</span> {report.report_data.report.depin_economics.token_economics.inflation_rate}
                        </p>
                      )}
                      {report.report_data.report.depin_economics.token_economics.reward_mechanism && (
                        <p className="text-sm">
                          <span className="font-medium">Reward Mechanism:</span> {report.report_data.report.depin_economics.token_economics.reward_mechanism}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {report.report_data.report.depin_economics.market_dynamics && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Market Dynamics</p>
                    <div className="space-y-2">
                      {report.report_data.report.depin_economics.market_dynamics.demand_drivers && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Demand Drivers</p>
                          <ul className="list-disc list-inside space-y-1">
                            {report.report_data.report.depin_economics.market_dynamics.demand_drivers.map((driver: string, index: number) => (
                              <li key={index} className="text-sm">{driver}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.report_data.report.depin_economics.market_dynamics.supply_factors && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Supply Factors</p>
                          <ul className="list-disc list-inside space-y-1">
                            {report.report_data.report.depin_economics.market_dynamics.supply_factors.map((factor: string, index: number) => (
                              <li key={index} className="text-sm">{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.report_data.report.depin_economics.market_dynamics.price_stability && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Price Stability</p>
                          <p className="text-sm">{report.report_data.report.depin_economics.market_dynamics.price_stability}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {report.report_data.report.depin_economics.economic_sustainability && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Economic Sustainability</p>
                    <p className="text-sm">{report.report_data.report.depin_economics.economic_sustainability}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Blockchain Publishes */}
      {publishes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-4 w-4 text-green-500" />
            <h3 className="text-lg font-semibold text-foreground">Blockchain Publication</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Blockchain</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Published</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tx Hash</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publishes.map((publish, index) => {
                  let explorerUrl = null;
                  if (publish.transaction_hash) {
                    if (publish.network === 'sui') {
                      if (publish.network_type === 'testnet') {
                        explorerUrl = `https://suiexplorer.com/txblock/${publish.transaction_hash}?network=testnet`;
                      } else {
                        explorerUrl = `https://suiexplorer.com/txblock/${publish.transaction_hash}?network=mainnet`;
                      }
                    } else if (publish.network === 'zksync') {
                      if (publish.network_type === 'testnet') {
                        explorerUrl = `https://sepolia.explorer.zksync.io/tx/${publish.transaction_hash}`;
                      } else {
                        explorerUrl = `https://explorer.zksync.io/tx/${publish.transaction_hash}`;
                      }
                    }
                  }
                  return (
                    <tr key={publish.uuid || index} className="hover:bg-surface-hover data-[state=selected]:bg-surface-secondary border-b border-border transition-colors">
                      <td className="px-4 py-3 align-middle text-primary">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{publish.report_title || 'Security Analysis Report'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{publish.report_uuid}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-primary">
                        <Badge variant="outline" className="uppercase">{publish.network}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-primary">
                        <Badge variant={publish.status === 'success' || publish.status === 'completed' ? 'default' : 'secondary'} className="uppercase font-semibold">
                          {publish.status === 'success' ? 'Completed' : publish.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {publish.created_at ? new Date(publish.created_at).toLocaleDateString() : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-xs font-mono text-muted-foreground">
                        <div className="truncate max-w-32" title={publish.transaction_hash}>{publish.transaction_hash}</div>
                      </td>
                      <td className="px-4 py-3 align-middle text-primary">
                        {explorerUrl ? (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on blockchain explorer"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hover:bg-surface-hover text-secondary hover:text-primary h-8 w-8 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link h-4 w-4"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No Findings Message */}
      {(!report.findings || Object.keys(report.findings).length === 0) && 
       (!report.report_data?.report || Object.keys(report.report_data.report).length === 0) && (
        <Card className="p-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground">This report contains no findings or report data.</p>
          </div>
        </Card>
      )}

      {/* Publish to Blockchain Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Publish Report to Blockchain</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Publish "{report.title}" to the blockchain for immutable storage and verification.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Blockchain
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="blockchain"
                      value="sui"
                      checked={selectedBlockchain === 'sui'}
                      onChange={(e) => setSelectedBlockchain(e.target.value as 'sui' | 'zksync')}
                      className="mr-2"
                    />
                    <span className="text-sm">Sui Network</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="blockchain"
                      value="zksync"
                      checked={selectedBlockchain === 'zksync'}
                      onChange={(e) => setSelectedBlockchain(e.target.value as 'sui' | 'zksync')}
                      className="mr-2"
                    />
                    <span className="text-sm">zkSync</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Publishing to the blockchain may take up to a minute. You'll receive a notification when the process is complete.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClosePublishModal}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublishReport}
                disabled={isPublishing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPublishing ? 'Publishing...' : `Publish to ${selectedBlockchain.toUpperCase()}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgNodeReportDetail;
