import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/custom/Skeleton';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock, ScanLine, FileText, Settings } from 'lucide-react';
import { complianceApi } from '@/services/compliance';
import type { ComplianceFramework } from '@/types/compliance';

export function ComplianceOverview() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFrameworks = async () => {
      try {
        const data = await complianceApi.getComplianceSummary();
        setFrameworks(data);
      } catch (error) {
        console.error('Failed to load compliance frameworks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFrameworks();
  }, []);

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend.startsWith('-')) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted" />;
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-success';
    if (compliance >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getComplianceBadge = (compliance: number) => {
    if (compliance >= 90) return <Badge variant="default" className="bg-success text-white">Excellent</Badge>;
    if (compliance >= 75) return <Badge variant="default" className="bg-warning text-white">Good</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  const handleFrameworkClick = (frameworkId: string) => {
    navigate(`/compliance/${frameworkId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Compliance Dashboard</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-4" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Compliance Dashboard</h1>
          <p className="text-muted mt-1">Monitor your validator nodes against regulatory frameworks</p>
        </div>
        <Button onClick={() => navigate('/compliance/templates')}>
          Manage Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework) => (
          <Card 
            key={framework.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFrameworkClick(framework.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                {getComplianceBadge(framework.compliance)}
              </div>
              {framework.description && (
                <p className="text-sm text-muted line-clamp-2">{framework.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getComplianceColor(framework.compliance)}`}>
                  {framework.compliance}%
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(framework.trend)}
                  <span className="text-sm font-medium">{framework.trend}</span>
                </div>
              </div>

              {framework.summary && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Controls</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span>{framework.summary.passed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-destructive" />
                        <span>{framework.summary.failed}</span>
                      </div>
                    </div>
                  </div>
                  
                  {framework.summary.critical > 0 && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{framework.summary.critical} critical issues</span>
                    </div>
                  )}

                  {framework.summary.nextAudit && (
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <Clock className="w-3 h-3" />
                      <span>Next audit: {new Date(framework.summary.nextAudit).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted">
                Last scan: {new Date(framework.lastScan).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-surface-secondary p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/compliance/scan')}
            className="justify-start"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Run New Scan
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/compliance/reports')}
            className="justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/compliance/templates')}
            className="justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Templates
          </Button>
        </div>
      </div>
    </div>
  );
} 