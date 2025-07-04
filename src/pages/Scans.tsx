import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Play, 
  Square, 
  Download, 
  RefreshCw, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const Scans: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    alert('Starting new network scan...');
    // Simulate scan completion
    setTimeout(() => {
      setIsScanning(false);
      alert('Scan completed!');
    }, 3000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    alert('Scan stopped!');
  };

  const handleViewScan = (scanId: string) => {
    alert(`Viewing scan details for: ${scanId}`);
  };

  const handleDownloadScan = (scanId: string) => {
    alert(`Downloading scan results for: ${scanId}`);
  };

  const handleRetryScan = (scanId: string) => {
    alert(`Retrying scan: ${scanId}`);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Scans' }
  ];

  // Mock scan data
  const scans = [
    {
      id: 'scan-001',
      name: 'Full Network Scan',
      status: 'completed' as const,
      progress: 100,
      startTime: '2024-07-04 14:30:00',
      duration: '2m 45s',
      nodesScanned: 247,
      issuesFound: 3,
      type: 'Full Scan'
    },
    {
      id: 'scan-002',
      name: 'Security Assessment',
      status: 'running' as const,
      progress: 67,
      startTime: '2024-07-04 15:15:00',
      duration: '1m 32s',
      nodesScanned: 165,
      issuesFound: 1,
      type: 'Security'
    },
    {
      id: 'scan-003',
      name: 'Performance Check',
      status: 'failed' as const,
      progress: 45,
      startTime: '2024-07-04 13:45:00',
      duration: '58s',
      nodesScanned: 112,
      issuesFound: 0,
      type: 'Performance'
    },
    {
      id: 'scan-004',
      name: 'Quick Health Check',
      status: 'completed' as const,
      progress: 100,
      startTime: '2024-07-04 12:20:00',
      duration: '45s',
      nodesScanned: 247,
      issuesFound: 0,
      type: 'Health'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Activity className="w-8 h-8 text-accent" />
            Network Scans
          </h1>
          <p className="text-secondary max-w-2xl mt-2">Monitor network health, security, and performance with comprehensive scanning</p>
        </div>
        <div className="flex gap-3">
          {isScanning ? (
            <Button variant="destructive" onClick={handleStopScan}>
              <Square className="w-4 h-4 mr-2" />
              Stop Scan
            </Button>
          ) : (
            <Button variant="default" onClick={handleStartScan}>
              <Play className="w-4 h-4 mr-2" />
              Start New Scan
            </Button>
          )}
        </div>
      </div>

      {/* Active Scan Status */}
      {isScanning && (
        <Card className="p-6 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary">Network Scan in Progress</h3>
              <p className="text-secondary">Scanning all nodes for security vulnerabilities and performance issues...</p>
              <div className="mt-2 w-full h-2 bg-white-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Table Section */}
      <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scan Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center text-secondary">
                          {scan.type === 'Security' ? <AlertTriangle className="w-5 h-5" /> :
                           scan.type === 'Performance' ? <Activity className="w-5 h-5" /> :
                           <Eye className="w-5 h-5" />}
                        </div>
                        <div>
                                                  <div className="font-medium text-primary">{scan.name}</div>
                        <div className="text-xs text-secondary">ID: {scan.id}</div>
                        <div className="text-xs text-secondary">{scan.startTime}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {scan.status === 'completed' && <CheckCircle className="w-4 h-4 text-success" />}
                        {scan.status === 'running' && <Clock className="w-4 h-4 text-warning animate-pulse" />}
                        {scan.status === 'failed' && <XCircle className="w-4 h-4 text-danger" />}
                        <Badge variant={
                          scan.status === 'completed' ? 'success' : 
                          scan.status === 'running' ? 'warning' : 
                          'destructive'
                        }>
                          {scan.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              scan.progress === 100 ? 'bg-success' :
                              scan.progress > 50 ? 'bg-warning' :
                              'bg-accent'
                            }`}
                            style={{ width: `${scan.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-primary">{scan.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-primary font-medium">{scan.nodesScanned} nodes</div>
                        <div className={`text-xs ${scan.issuesFound > 0 ? 'text-danger' : 'text-success'}`}>
                          {scan.issuesFound} issues found
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4" />
                        {scan.duration}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewScan(scan.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadScan(scan.id)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {scan.status === 'failed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRetryScan(scan.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Card>
    </div>
  );
};

export default Scans;
