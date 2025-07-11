import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  Shield, 
  Target, 
  CheckCircle, 
  XCircle, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import type { CveMatch } from '@/types/node';

const OrgNodeCveDetail: React.FC = () => {
  const { slug, nodeId, cveUuid } = useParams<{ slug: string; nodeId: string; cveUuid: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [cve, setCve] = useState<CveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchCve = async () => {
      if (!organizationUuid || !nodeId || !cveUuid) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch the specific CVE
        const cveData = await NodeApiService.getNodeCveMatch(organizationUuid, nodeId, cveUuid);
        setCve(cveData);
      } catch (err) {
        console.error('Error fetching CVE:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch CVE');
      } finally {
        setLoading(false);
      }
    };

    fetchCve();
  }, [organizationUuid, nodeId, cveUuid]);

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (fixed: boolean) => {
    return fixed ? 'secondary' : 'destructive';
  };

  const getCvssSeverity = (score: number) => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading CVE details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!orgsLoading && !organization)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading CVE</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cve) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">CVE Not Found</h2>
            <p className="text-gray-500">The requested CVE could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Link 
              to={`/organizations/${slug}/nodes/${nodeId}/cves`}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to CVEs
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                <AlertTriangle className="h-8 w-8 inline mr-2" />
                {cve.cve_id}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Security vulnerability details for {organization?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getSeverityVariant(cve.severity)} className="text-lg px-4 py-2">
                {cve.severity}
              </Badge>
              <Badge variant={getStatusVariant(cve.fixed)} className="text-lg px-4 py-2">
                {cve.fixed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Fixed
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Open
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CVE Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Vulnerability Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CVE ID</label>
                    <p className="font-mono text-lg">{cve.cve_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Match UUID</label>
                    <p className="font-mono text-sm text-muted-foreground">{cve.match_uuid}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Severity</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityVariant(cve.severity)}>
                        {cve.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(cve.fixed)}>
                        {cve.fixed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Fixed
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Open
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{cve.cve_description || 'No description available'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Match Reason</label>
                  <p className="mt-1">{cve.match_reason}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Match Type</label>
                  <p className="mt-1 capitalize">{cve.match_type?.replace('_', ' ')}</p>
                </div>
              </CardContent>
            </Card>

            {/* CVSS Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  CVSS Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CVSS Score</label>
                    <p className="text-2xl font-bold">{cve.cvss_score}</p>
                    <p className="text-sm text-muted-foreground">
                      {getCvssSeverity(cve.cvss_score)} severity
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                    <p className="text-2xl font-bold">{(cve.confidence_score * 100).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      Detection confidence
                    </p>
                  </div>
                </div>
                
                {cve.cve_cvss_vector && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CVSS Vector</label>
                    <p className="font-mono text-sm mt-1">{cve.cve_cvss_vector}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Affected Products */}
            {cve.affected_products && cve.affected_products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Affected Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cve.affected_products.map((product, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-mono text-sm">{product}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fix Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Fix Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      {cve.fixed ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-700">Fixed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-700">Open</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Fixed</label>
                    <p className="mt-1">{formatDate(cve.date_fixed)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fixed Version</label>
                    <p className="mt-1">{cve.fixed_version || 'Not available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fixed By</label>
                    <p className="mt-1">{cve.fixed_by_user_uuid || 'Not available'}</p>
                  </div>
                </div>
                
                {cve.fixed_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fix Notes</label>
                    <p className="mt-1">{cve.fixed_notes}</p>
                  </div>
                )}

                {cve.fix_info && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Fix Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fix Available:</span>
                        <span className="ml-2">{cve.fix_info.fix_available ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Patch Version:</span>
                        <span className="ml-2">{cve.fix_info.patch_version || 'Not available'}</span>
                      </div>
                    </div>
                    
                    {cve.fix_info.remediation_steps && (
                      <div>
                        <span className="text-muted-foreground">Remediation Steps:</span>
                        <p className="mt-1">{cve.fix_info.remediation_steps}</p>
                      </div>
                    )}
                    
                    {cve.fix_info.workaround && (
                      <div>
                        <span className="text-muted-foreground">Workaround:</span>
                        <p className="mt-1">{cve.fix_info.workaround}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Vulnerability Published</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(cve.cve_published_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Vulnerability Detected</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(cve.matched_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Last Modified</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(cve.cve_last_modified)}
                      </p>
                    </div>
                  </div>
                  {cve.fixed && cve.date_fixed && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Vulnerability Fixed</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(cve.date_fixed)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/organizations/${slug}/nodes/${nodeId}/cves`}>
                  <Button variant="outline" className="w-full">
                    View All CVEs
                  </Button>
                </Link>
                <Link to={`/organizations/${slug}/nodes/${nodeId}`}>
                  <Button variant="outline" className="w-full">
                    Back to Node
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Severity</span>
                  <Badge variant={getSeverityVariant(cve.severity)}>
                    {cve.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CVSS Score</span>
                  <span className="font-medium">{cve.cvss_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <div className="flex items-center gap-1">
                    {cve.fixed ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <Badge variant={getStatusVariant(cve.fixed)}>
                      {cve.fixed ? 'Fixed' : 'Open'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confidence</span>
                  <span className="font-medium">{(cve.confidence_score * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Scan Date:</span>
                  <p className="text-sm">{formatDate(cve.scan_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Target IP:</span>
                  <p className="text-sm">{cve.target_ip || 'Not available'}</p>
                </div>
                {cve.cve_source && (
                  <div>
                    <span className="text-sm text-muted-foreground">Source:</span>
                    <p className="text-sm">{cve.cve_source}</p>
                  </div>
                )}
                {cve.cwe_ids && cve.cwe_ids.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">CWE IDs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cve.cwe_ids.map((cwe, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cwe}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgNodeCveDetail; 