import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';

const Organizations: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'enterprise'
  });

  const handleCreateOrg = () => {
    setFormData({ name: '', description: '', type: 'enterprise' });
    setShowCreateModal(true);
  };


  const handleSaveOrg = () => {
    // TODO: Implement API call to save organization
    console.log('Saving organization:', formData);
    alert(`Organization "${formData.name}" saved successfully!`);
    setShowCreateModal(false);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Organizations' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-surface-secondary p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Organizations</h1>
              <p className="text-secondary mt-1">Manage your DePIN organizations and network monitoring</p>
            </div>
          </div>
        </div>
        <Button variant="default" onClick={handleCreateOrg}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>
      
      {/* Table Section */}
      <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-secondary">
                <TableHead className="text-primary font-semibold">Organization</TableHead>
                <TableHead className="text-primary font-semibold">Nodes</TableHead>
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-primary font-semibold">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-surface-hover">
                <TableCell>
                  <Link to="/?org=techcorp-inc" className="hover:underline">
                    <div className="text-sm font-medium text-primary">TechCorp Inc.</div>
                    <div className="text-xs text-secondary">Enterprise organization</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    to="/?org=techcorp-inc" 
                    className="text-link font-medium hover:text-link-hover hover:underline transition-colors"
                  >
                    23 nodes
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell className="text-secondary">2 hours ago</TableCell>
              </TableRow>
              
              <TableRow className="hover:bg-surface-hover">
                <TableCell>
                  <Link to="/?org=dataflow-systems" className="hover:underline">
                    <div className="text-sm font-medium text-primary">DataFlow Systems</div>
                    <div className="text-xs text-secondary">Startup organization</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    to="/?org=dataflow-systems" 
                    className="text-link font-medium hover:text-link-hover hover:underline transition-colors"
                  >
                    12 nodes
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell className="text-secondary">4 hours ago</TableCell>
              </TableRow>
              
              <TableRow className="hover:bg-surface-hover">
                <TableCell>
                  <Link to="/?org=cloudnet-solutions" className="hover:underline">
                    <div className="text-sm font-medium text-primary">CloudNet Solutions</div>
                    <div className="text-xs text-secondary">Individual organization</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    to="/?org=cloudnet-solutions" 
                    className="text-link font-medium hover:text-link-hover hover:underline transition-colors"
                  >
                    5 nodes
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
                <TableCell className="text-secondary">1 day ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        {/* TODO: Add pagination, search, filters, bulk actions, real-time status updates */}
        
        {/* Create Organization Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
              <Card className="shadow-2xl border border-border bg-surface rounded-2xl">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-6">
                    Create New Organization
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                        placeholder="Enter organization name"
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
                        placeholder="Enter organization description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        Organization Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveOrg}
                    >
                      Create Organization
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      
    </div>
  );
}

export default Organizations;
