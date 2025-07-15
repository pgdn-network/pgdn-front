import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/custom/Skeleton';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { complianceApi } from '@/services/compliance';
import type { ComplianceControl } from '@/types/compliance';

export function ComplianceDetail() {
  const { frameworkId } = useParams<{ frameworkId: string }>();
  const navigate = useNavigate();
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!frameworkId) return;

    const loadData = async () => {
      try {
        const controlsData = await complianceApi.getFrameworkControls(frameworkId);
        setControls(controlsData);
      } catch (error) {
        console.error('Failed to load compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [frameworkId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-destructive text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-warning text-white';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'FAILED': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'WARNING': return <Clock className="w-4 h-4 text-warning" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const handleExport = async (format: 'pdf' | 'json') => {
    if (!frameworkId) return;
    
    setExporting(true);
    try {
      const blob = await complianceApi.exportReport(frameworkId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${frameworkId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleRunScan = () => {
    navigate(`/compliance/scan?framework=${frameworkId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const failedControls = controls.filter(c => c.status === 'FAILED');
  const passedControls = controls.filter(c => c.status === 'PASSED');
  const totalControls = controls.length;
  const compliancePercentage = totalControls > 0 ? Math.round((passedControls.length / totalControls) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/compliance')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">
            {frameworkId?.toUpperCase()} Compliance
          </h1>
          <p className="text-muted mt-1">Detailed control analysis and remediation steps</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunScan}
            disabled={exporting}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Scan
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button 
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Compliance</p>
                <p className="text-2xl font-bold">{compliancePercentage}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total Controls</p>
                <p className="text-2xl font-bold">{totalControls}</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Passed</p>
                <p className="text-2xl font-bold text-success">{passedControls.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Failed</p>
                <p className="text-2xl font-bold text-destructive">{failedControls.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Control Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Control ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => (
                <TableRow key={control.controlId}>
                  <TableCell className="font-mono text-sm">{control.controlId}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2">{control.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(control.status)}
                      <Badge variant={control.status === 'PASSED' ? 'default' : 'destructive'}>
                        {control.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(control.severity)}>
                      {control.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{control.category}</div>
                      {control.subcategory && (
                        <div className="text-muted">{control.subcategory}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Control: {control.controlId}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted">{control.description}</p>
                          </div>
                          
                          {control.evidence && (
                            <div>
                              <h4 className="font-semibold mb-2">Evidence</h4>
                              <div className="bg-surface-secondary p-3 rounded text-sm">
                                <div className="text-muted mb-1">
                                  {new Date(control.evidence.timestamp).toLocaleString()}
                                </div>
                                <pre className="whitespace-pre-wrap text-xs">
                                  {JSON.stringify(control.evidence, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {control.remediation && control.remediation.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Remediation Steps</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {control.remediation.map((step, index) => (
                                  <li key={index} className="text-muted">{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {control.references && control.references.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">References</h4>
                              <ul className="space-y-1 text-sm">
                                {control.references.map((ref, index) => (
                                  <li key={index}>
                                    <a 
                                      href={ref} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {ref}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 