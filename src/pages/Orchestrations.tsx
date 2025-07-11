import React, { useState } from 'react';
import { Settings, Play, Pause, Clock, Workflow, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';

const Orchestrations: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule: 'daily',
    enabled: true
  });

  const handleCreateOrchestration = () => {
    setFormData({ name: '', description: '', schedule: 'daily', enabled: true });
    setShowCreateModal(true);
  };

  const handleSaveOrchestration = () => {
    alert(`Orchestration "${formData.name}" created successfully!`);
    setShowCreateModal(false);
  };

  const handleRunOrchestration = (id: string) => {
    alert(`Running orchestration: ${id}`);
  };

  const handleViewOrchestration = (id: string) => {
    alert(`Viewing orchestration: ${id}`);
  };

  const handleEditOrchestration = (id: string) => {
    alert(`Editing orchestration: ${id}`);
  };

  const handleDeleteOrchestration = (id: string) => {
    alert(`Deleting orchestration: ${id}`);
  };


  // Mock orchestration data
  const orchestrations = [
    {
      id: 'orch-001',
      name: 'Daily Security Scan',
      description: 'Automated daily security vulnerability assessment',
      status: 'active' as const,
      schedule: 'Daily at 2:00 AM',
      lastRun: '2024-07-04 02:00:00',
      nextRun: '2024-07-05 02:00:00',
      successRate: 98,
      totalRuns: 247
    },
    {
      id: 'orch-002',
      name: 'Weekly Performance Report',
      description: 'Weekly network performance analysis and reporting',
      status: 'active' as const,
      schedule: 'Weekly on Sundays',
      lastRun: '2024-06-30 03:00:00',
      nextRun: '2024-07-07 03:00:00',
      successRate: 100,
      totalRuns: 52
    },
    {
      id: 'orch-003',
      name: 'Node Health Check',
      description: 'Continuous monitoring of node health and availability',
      status: 'paused' as const,
      schedule: 'Every 15 minutes',
      lastRun: '2024-07-04 14:45:00',
      nextRun: '---',
      successRate: 95,
      totalRuns: 1247
    },
    {
      id: 'orch-004',
      name: 'Compliance Audit',
      description: 'Monthly compliance and regulatory audit workflow',
      status: 'error' as const,
      schedule: 'Monthly on 1st',
      lastRun: '2024-07-01 01:00:00',
      nextRun: '2024-08-01 01:00:00',
      successRate: 87,
      totalRuns: 12
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-surface-secondary p-2">
              <Workflow className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Orchestrations</h1>
              <p className="text-secondary mt-1">Manage automated scanning configurations and workflows</p>
            </div>
          </div>
        </div>
        <Button variant="default" onClick={handleCreateOrchestration}>
          <Plus className="w-4 h-4 mr-2" />
          Create Orchestration
        </Button>
      </div>

      {/* Orchestration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <Workflow className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Total</h3>
                <p className="text-3xl font-bold text-primary">12</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <Play className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Active</h3>
                <p className="text-3xl font-bold text-primary">8</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <Pause className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Paused</h3>
                <p className="text-3xl font-bold text-primary">3</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-secondary flex items-center justify-center">
                <Settings className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Issues</h3>
                <p className="text-3xl font-bold text-primary">1</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orchestrations Table */}
        <Card className="p-0">
          <Table>
            <TableHeader>
                              <TableRow className="bg-surface-secondary">
                  <TableHead className="text-primary font-semibold">Name</TableHead>
                  <TableHead className="text-primary font-semibold">Status</TableHead>
                  <TableHead className="text-primary font-semibold">Schedule</TableHead>
                  <TableHead className="text-primary font-semibold">Last Run</TableHead>
                  <TableHead className="text-primary font-semibold">Success Rate</TableHead>
                  <TableHead className="text-primary font-semibold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {orchestrations.map((orchestration) => (
                <TableRow key={orchestration.id} className="hover:bg-surface-hover">
                  <TableCell>
                    <div className="text-sm font-medium text-primary">{orchestration.name}</div>
                    <div className="text-xs text-secondary">{orchestration.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      orchestration.status === 'active' ? 'success' :
                      orchestration.status === 'paused' ? 'warning' :
                      'destructive'
                    }>
                      {orchestration.status === 'active' ? 'Active' :
                       orchestration.status === 'paused' ? 'Paused' :
                       'Error'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-secondary flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {orchestration.schedule}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-secondary">
                    {new Date(orchestration.lastRun).toLocaleDateString()} at {new Date(orchestration.lastRun).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-primary">{orchestration.successRate}%</div>
                    <div className="text-xs text-secondary">{orchestration.totalRuns} runs</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrchestration(orchestration.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRunOrchestration(orchestration.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditOrchestration(orchestration.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteOrchestration(orchestration.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Create Orchestration Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
              <Card className="shadow-2xl border border-border bg-surface rounded-2xl">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-6">
                    Create New Orchestration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                        placeholder="Enter orchestration name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                        rows={3}
                        placeholder="Enter orchestration description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Schedule
                      </label>
                      <select
                        value={formData.schedule}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="hourly">Hourly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                        className="rounded border-border"
                      />
                      <label className="text-sm text-primary">
                        Enable orchestration immediately
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveOrchestration}
                    >
                      Create Orchestration
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

export default Orchestrations;
