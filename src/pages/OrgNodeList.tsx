import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/custom/Card';
import { StatusDot } from '@/components/ui/custom/StatusDot';
import { Badge } from '@/components/ui/custom/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Edit2, Server, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const OrgNodeList: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [formData, setFormData] = useState({
    nodeId: '',
    type: 'storage',
    ipAddress: '',
    port: '8080'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    type: 'enterprise'
  });

  const handleAddNode = () => {
    setShowAddNodeModal(true);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleEditOrg = () => {
    // Pre-populate form with current org data
    setEditFormData({
      name: orgName,
      description: 'Sample organization description',
      type: 'enterprise'
    });
    setShowEditOrgModal(true);
  };

  const handleSaveNode = () => {
    // TODO: Implement API call to add node
    console.log('Adding node to organization:', uid, formData);
    alert(`Added node ${formData.nodeId} to organization`);
    setShowAddNodeModal(false);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleSaveOrg = () => {
    // TODO: Implement API call to update organization
    console.log('Updating organization:', uid, editFormData);
    alert(`Updated organization: ${editFormData.name}`);
    setShowEditOrgModal(false);
  };

  const handleCloseModal = () => {
    setShowAddNodeModal(false);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleCloseEditModal = () => {
    setShowEditOrgModal(false);
  };
  
  // Mock organization data - in real app this would come from API
  const orgName = uid === '550e8400-e29b-41d4-a716-446655440000' ? 'TechCorp Inc.' :
                  uid === '6ba7b810-9dad-11d1-80b4-00c04fd430c8' ? 'DataFlow Systems' :
                  uid === '6ba7b811-9dad-11d1-80b4-00c04fd430c8' ? 'CloudNet Solutions' :
                  'Unknown Organization';
  
  // Mock node data for this organization
  const organizationNodes = [
    {
      id: 'node-001',
      name: 'DePIN Node Alpha',
      type: 'Storage',
      status: 'online' as const,
      location: 'New York, NY',
      uptime: '99.9%',
      lastSeen: '2 minutes ago',
      performance: 95,
      resources: '85% CPU, 67% Memory'
    },
    {
      id: 'node-002',
      name: 'DePIN Node Beta',
      type: 'Compute',
      status: 'offline' as const,
      location: 'San Francisco, CA',
      uptime: '98.7%',
      lastSeen: '1 hour ago',
      performance: 0,
      resources: 'N/A'
    },
    {
      id: 'node-003',
      name: 'DePIN Node Gamma',
      type: 'Network',
      status: 'online' as const,
      location: 'Austin, TX',
      uptime: '95.2%',
      lastSeen: '5 minutes ago',
      performance: 88,
      resources: '72% CPU, 54% Memory'
    }
  ];

  const stats = [
    {
      title: 'Total Nodes',
      value: orgName === 'TechCorp Inc.' ? '23' : 
              orgName === 'DataFlow Systems' ? '15' : 
              orgName === 'CloudNet Solutions' ? '8' : '0',
      icon: Server,
      description: 'Active network nodes'
    },
    {
      title: 'Active Nodes',
      value: orgName === 'TechCorp Inc.' ? '21' : 
              orgName === 'DataFlow Systems' ? '14' : 
              orgName === 'CloudNet Solutions' ? '6' : '0',
      icon: CheckCircle,
      description: 'Online and responding'
    },
    {
      title: 'Offline Nodes',
      value: orgName === 'TechCorp Inc.' ? '2' : 
              orgName === 'DataFlow Systems' ? '1' : 
              orgName === 'CloudNet Solutions' ? '2' : '0',
      icon: AlertCircle,
      description: 'Require attention'
    },
    {
      title: 'Uptime',
      value: orgName === 'TechCorp Inc.' ? '99.2%' : 
              orgName === 'DataFlow Systems' ? '98.7%' : 
              orgName === 'CloudNet Solutions' ? '97.1%' : '0%',
      icon: Activity,
      description: 'Average system uptime'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">{orgName}</h1>
              <p className="text-lg text-secondary">Organization overview and node management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleEditOrg}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Organization
          </Button>
          <Button variant="default" onClick={handleAddNode}>
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-secondary flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-widest">{stat.title}</p>
                <p className="text-sm text-secondary">{stat.description}</p>
              </div>
            </div>
            <p className="text-3xl font-black text-primary leading-none">{stat.value}</p>
          </Card>
        ))}
      </div>
      {/* Table Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Server className="w-5 h-5 text-secondary" />
            Organization Nodes
          </h2>
        </div>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizationNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-secondary flex items-center justify-center">
                        <Server className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{node.name}</p>
                        <p className="text-xs text-muted">ID: {node.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{node.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusDot status={node.status} />
                      <span className="capitalize text-sm">{node.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{node.location}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{node.uptime}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{node.lastSeen}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-secondary h-2">
                        <div 
                          className="h-2 bg-secondary"
                          style={{ width: `${node.performance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{node.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/organizations/${uid}/nodes/${node.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      
      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
            <Card className="shadow-2xl border border-border bg-surface rounded-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-6">
                  Add New Node to {orgName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Node ID
                    </label>
                    <input
                      type="text"
                      value={formData.nodeId}
                      onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      placeholder="Enter node ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Node Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                    >
                      <option value="storage">Storage</option>
                      <option value="compute">Compute</option>
                      <option value="network">Network</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Port
                    </label>
                    <input
                      type="text"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      placeholder="8080"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSaveNode}
                  >
                    Add Node
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
            <Card className="shadow-2xl border border-border bg-surface rounded-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-6">
                  Edit Organization
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                      rows={3}
                      placeholder="Enter organization description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Organization Type
                    </label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                    >
                      <option value="enterprise">Enterprise</option>
                      <option value="startup">Startup</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={handleCloseEditModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSaveOrg}
                  >
                    Save Changes
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

export default OrgNodeList;
