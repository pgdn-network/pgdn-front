import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { complianceApi } from '@/services/compliance';
import type { ComplianceFramework } from '@/types/compliance';

export default function ComplianceScan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [scanLevel, setScanLevel] = useState<'basic' | 'comprehensive' | 'audit'>('basic');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanId, setScanId] = useState<string>('');

  useEffect(() => {
    const loadFrameworks = async () => {
      try {
        const data = await complianceApi.getComplianceSummary();
        setFrameworks(data);
        
        // Set default framework from URL params
        const frameworkParam = searchParams.get('framework');
        if (frameworkParam && data.find(f => f.id === frameworkParam)) {
          setSelectedFramework(frameworkParam);
        } else if (data.length > 0) {
          setSelectedFramework(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load frameworks:', error);
      }
    };

    loadFrameworks();
  }, [searchParams]);

  useEffect(() => {
    if (!scanId || !isScanning) return;

    const pollScanStatus = async () => {
      try {
        const status = await complianceApi.getScanStatus(scanId);
        setScanProgress(status.progress || 0);
        setScanStatus(status.status);

        if (status.status === 'completed') {
          setIsScanning(false);
          // Navigate to results
          navigate(`/compliance/${selectedFramework}`);
        } else if (status.status === 'failed') {
          setIsScanning(false);
          setScanStatus('Scan failed');
        } else {
          // Continue polling
          setTimeout(pollScanStatus, 2000);
        }
      } catch (error) {
        console.error('Failed to get scan status:', error);
        setIsScanning(false);
        setScanStatus('Failed to get scan status');
      }
    };

    pollScanStatus();
  }, [scanId, isScanning, selectedFramework, navigate]);

  const handleStartScan = async () => {
    if (!selectedFramework) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('Initializing scan...');

    try {
      const response = await complianceApi.triggerComplianceScan({
        framework: selectedFramework,
        scanLevel,
        includeEvidence: true
      });

      setScanId(response.scanId);
      setScanStatus('Scan queued...');
    } catch (error) {
      console.error('Failed to start scan:', error);
      setIsScanning(false);
      setScanStatus('Failed to start scan');
    }
  };

  const getScanLevelDescription = (level: string) => {
    switch (level) {
      case 'basic': return 'Quick scan of essential controls';
      case 'comprehensive': return 'Detailed scan with evidence collection';
      case 'audit': return 'Full audit with remediation recommendations';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted" />;
    }
  };

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
          <h1 className="text-2xl font-bold text-primary">Compliance Scan</h1>
          <p className="text-muted mt-1">Run compliance scans against your validator nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="framework">Compliance Framework</Label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((framework) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      <div className="flex items-center gap-2">
                        <span>{framework.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {framework.compliance}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scanLevel">Scan Level</Label>
              <Select value={scanLevel} onValueChange={(value: 'basic' | 'comprehensive' | 'audit') => setScanLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div>
                      <div className="font-medium">Basic</div>
                      <div className="text-sm text-muted">Quick scan of essential controls</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="comprehensive">
                    <div>
                      <div className="font-medium">Comprehensive</div>
                      <div className="text-sm text-muted">Detailed scan with evidence collection</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="audit">
                    <div>
                      <div className="font-medium">Audit</div>
                      <div className="text-sm text-muted">Full audit with remediation recommendations</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted mt-1">
                {getScanLevelDescription(scanLevel)}
              </p>
            </div>

            <Button 
              onClick={handleStartScan}
              disabled={!selectedFramework || isScanning}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </Button>
          </CardContent>
        </Card>

        {/* Scan Status */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isScanning ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(scanStatus)}
                  <span className="text-sm font-medium">{scanStatus}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                </div>

                <div className="text-sm text-muted">
                  Estimated completion: {scanProgress > 0 ? 
                    `${Math.round((100 - scanProgress) / 10)} minutes` : 
                    'Calculating...'
                  }
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active scan</p>
                <p className="text-sm">Configure and start a scan to see progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Framework Information */}
      {selectedFramework && (
        <Card>
          <CardHeader>
            <CardTitle>Framework Information</CardTitle>
          </CardHeader>
          <CardContent>
            {frameworks.find(f => f.id === selectedFramework) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium">Current Compliance</h4>
                  <p className="text-2xl font-bold">
                    {frameworks.find(f => f.id === selectedFramework)?.compliance}%
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Last Scan</h4>
                  <p className="text-sm text-muted">
                    {frameworks.find(f => f.id === selectedFramework)?.lastScan ? 
                      new Date(frameworks.find(f => f.id === selectedFramework)!.lastScan).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Trend</h4>
                  <p className="text-sm">
                    {frameworks.find(f => f.id === selectedFramework)?.trend}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 