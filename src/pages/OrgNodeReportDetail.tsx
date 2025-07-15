import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Calendar, 
  AlertTriangle, 
  Shield, 
  Code, 
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { NodeApiService } from '@/api/nodes';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import type { NodeReport, ReportFinding } from '@/types/node';

const OrgNodeReportDetail: React.FC = () => {
  const { slug, nodeId, reportUuid } = useParams<{ slug: string; nodeId: string; reportUuid: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [report, setReport] = useState<NodeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchReport = async () => {
      if (!organizationUuid || !nodeId || !reportUuid) return;

      setLoading(true);
      setError(null);

      try {
        const reportData = await NodeApiService.getNodeReport(organizationUuid, nodeId, reportUuid);
        setReport(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [organizationUuid, nodeId, reportUuid]);

  const getRiskScoreVariant = (score: number): 'destructive' | 'secondary' | 'default' => {
    if (score >= 15) return 'destructive';
    if (score >= 10) return 'secondary';
    return 'default';
  };

  const getRiskScoreLabel = (score: number): string => {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  const getExploitationEaseVariant = (ease: string): 'destructive' | 'secondary' | 'default' => {
    switch (ease.toLowerCase()) {
      case 'easy': return 'destructive';
      case 'medium': return 'secondary';
      case 'hard': return 'default';
      default: return 'default';
    }
  };

  const getFindingIcon = (category: string) => {
    switch (category) {
      case 'urgent_fixes': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'critical_risks': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'convenient_fixes': return <CheckCircle className="h-4 w-4 text-warning" />;
      case 'documentation_items': return <Info className="h-4 w-4 text-secondary" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getFindingTitle = (category: string): string => {
    switch (category) {
      case 'urgent_fixes': return 'Urgent Fixes Required';
      case 'critical_risks': return 'Critical Security Risks';
      case 'convenient_fixes': return 'Convenient Improvements';
      case 'documentation_items': return 'Documentation & Notes';
      default: return 'Other Findings';
    }
  };

  const getFindingDescription = (category: string): string => {
    switch (category) {
      case 'urgent_fixes': return 'Issues that require immediate attention to prevent security breaches';
      case 'critical_risks': return 'High-priority security vulnerabilities that pose significant threats';
      case 'convenient_fixes': return 'Recommended improvements for better security posture';
      case 'documentation_items': return 'Important notes and documentation requirements';
      default: return 'Additional findings and recommendations';
    }
  };

  if (loading || orgsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Report</h3>
            <p className="text-muted-foreground mb-4">{error || 'Report not found'}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              to={`/organizations/${slug}/nodes/${nodeId}/reports`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent" />
              {report.title}
            </h1>
          </div>
          <p className="text-secondary max-w-2xl">
            {report.summary}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={getRiskScoreVariant(report.risk_score)}
            className="text-sm"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            {getRiskScoreLabel(report.risk_score)} Risk ({report.risk_score})
          </Badge>
        </div>
      </div>

      {/* Report Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center rounded-lg">
              <Shield className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Type</p>
              <p className="font-medium">{report.report_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </Card>

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
              <p className="font-medium">{report.risk_score}/20</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Metadata */}
      {report.report_metadata && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Report Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Analyzer</p>
              <p className="font-medium">{report.report_metadata.persona}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API Provider</p>
              <p className="font-medium">{report.report_metadata.api_provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">{report.report_metadata.analyzer_version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Generated At</p>
              <p className="font-medium">{new Date(report.report_metadata.generated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Report Type</p>
              <p className="font-medium">{report.report_metadata.report_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Findings */}
      {report.findings && (
        <div className="space-y-6">
          {Object.entries(report.findings).map(([category, findings]) => {
            if (!findings || findings.length === 0) return null;
            
            return (
              <Card key={category} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {getFindingIcon(category)}
                  <h3 className="text-lg font-semibold text-foreground">
                    {getFindingTitle(category)}
                  </h3>
                  <Badge variant="outline">{findings.length} items</Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  {getFindingDescription(category)}
                </p>
                
                <div className="space-y-4">
                  {findings.map((finding: ReportFinding, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground">{finding.issue}</h4>
                        <Badge 
                          variant={getExploitationEaseVariant(finding.exploitation_ease)}
                          className="text-xs"
                        >
                          {finding.exploitation_ease} to exploit
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Evidence</p>
                          <p className="text-sm bg-muted p-2 rounded">{finding.evidence}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Analysis</p>
                          <p className="text-sm">{finding.maya_analysis}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Findings Message */}
      {(!report.findings || Object.keys(report.findings).length === 0) && (
        <Card className="p-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Findings</h3>
            <p className="text-muted-foreground">
              This report contains no security findings or recommendations.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrgNodeReportDetail; 