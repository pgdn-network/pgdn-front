import React, { useState } from 'react';
import { BarChart3, FileText, Download, Eye, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';

const Reports: React.FC = () => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState('network-summary');

  const handleGenerateReport = () => {
    setShowGenerateModal(true);
  };

  const handleDownloadReport = (reportId: string) => {
    alert(`Downloading report: ${reportId}`);
  };

  const handleViewReport = (reportId: string) => {
    alert(`Viewing report: ${reportId}`);
  };


  // Mock report data
  const reports = [
    {
      id: 'rpt-001',
      name: 'Network Performance Summary',
      type: 'Performance',
      generatedAt: '2024-07-04 14:30:00',
      status: 'completed' as const,
      size: '2.3 MB',
      format: 'PDF',
      description: 'Monthly network performance analysis'
    },
    {
      id: 'rpt-002',
      name: 'Security Assessment Report',
      type: 'Security',
      generatedAt: '2024-07-04 13:15:00',
      status: 'completed' as const,
      size: '1.8 MB',
      format: 'PDF',
      description: 'Comprehensive security vulnerability assessment'
    },
    {
      id: 'rpt-003',
      name: 'Node Health Analysis',
      type: 'Health',
      generatedAt: '2024-07-04 12:45:00',
      status: 'generating' as const,
      size: '---',
      format: 'PDF',
      description: 'Real-time node health monitoring report'
    },
    {
      id: 'rpt-004',
      name: 'Compliance Report',
      type: 'Compliance',
      generatedAt: '2024-07-03 16:20:00',
      status: 'failed' as const,
      size: '---',
      format: 'PDF',
      description: 'Network compliance and audit report'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-accent" />
            Reports
          </h1>
          <p className="text-secondary max-w-2xl mt-2">Generate and manage network analysis reports</p>
        </div>
        <Button variant="default" onClick={handleGenerateReport}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Total Reports</h3>
                <p className="text-3xl font-bold text-primary">24</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">This Month</h3>
                <p className="text-3xl font-bold text-primary">8</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Last Report</h3>
                <p className="text-sm font-medium text-secondary">2 hours ago</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-primary">{report.name}</div>
                      <div className="text-xs text-secondary">{report.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        report.type === 'Performance' ? 'default' :
                        report.type === 'Security' ? 'destructive' :
                        report.type === 'Health' ? 'success' :
                        'secondary'
                      }>
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(report.generatedAt).toLocaleDateString()} at {new Date(report.generatedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        report.status === 'completed' ? 'success' :
                        report.status === 'generating' ? 'warning' :
                        'destructive'
                      }>
                        {report.status === 'completed' ? 'Ready' :
                         report.status === 'generating' ? 'Generating' :
                         'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-secondary">{report.size}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewReport(report.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {report.status === 'completed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(report.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Card>

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
              <Card className="shadow-xl border border-gray-200 bg-white rounded-2xl">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Generate New Report
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Report Type
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-gray-900"
                      >
                        <option value="network-summary">Network Summary</option>
                        <option value="performance">Performance Analysis</option>
                        <option value="security">Security Assessment</option>
                        <option value="compliance">Compliance Report</option>
                        <option value="health">Node Health Report</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Time Period
                      </label>
                      <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-gray-900">
                        <option value="last-24h">Last 24 Hours</option>
                        <option value="last-week">Last Week</option>
                        <option value="last-month">Last Month</option>
                        <option value="last-quarter">Last Quarter</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Format
                      </label>
                      <select className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-gray-900">
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setShowGenerateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        alert('Report generation started!');
                        setShowGenerateModal(false);
                      }}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
    </div>
  );
};

export default Reports;
