import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Eye, Server } from 'lucide-react';

import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationsContext';

const Organizations: React.FC = () => {
  const { organizations, loading, error, refetch, clearCache } = useOrganizations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'enterprise'
  });

  // Clear cache and fetch fresh data when component mounts
  useEffect(() => {
    clearCache();
    refetch();
  }, []); // Empty dependency array - only run on mount

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
        <div className="flex space-x-3">
          <Button variant="default" onClick={handleCreateOrg}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>
      
      {/* Table Section */}
      <Card className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-secondary">Loading organizations...</div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">Error loading organizations: {error}</div>
            <Button onClick={refetch} variant="outline">Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-secondary">
                <TableHead className="text-primary font-semibold">Organization</TableHead>
                <TableHead className="text-primary font-semibold">Role</TableHead>
                <TableHead className="text-primary font-semibold">Status</TableHead>
                <TableHead className="text-primary font-semibold">Joined</TableHead>
                <TableHead className="text-primary font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-secondary">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.uuid} className="hover:bg-surface-hover">
                    <TableCell>
                      <Link to={`/?org=${org.slug}`} className="hover:underline">
                        <div className="text-sm font-medium text-primary">{org.name}</div>
                        <div className="text-xs text-secondary">{org.slug}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{org.role_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={org.membership_active ? "success" : "warning"}>
                        {org.membership_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-secondary">
                      {new Date(org.joined_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/?org=${org.slug}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-secondary hover:text-primary border border-border rounded hover:bg-surface-hover transition-colors"
                          title="View Nodes"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Nodes
                        </Link>
                        <Link
                          to={`/organizations/${org.slug}/nodes/create`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-secondary hover:text-primary border border-border rounded hover:bg-surface-hover transition-colors"
                          title="Create Node"
                        >
                          <Server className="h-3 w-3 mr-1" />
                          Add Node
                        </Link>
                        {/* TODO: Create organization settings page */}
                        {/* <Link 
                          to={`/organizations/${org.slug}/settings`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-secondary hover:text-primary border border-border rounded hover:bg-surface-hover transition-colors"
                          title="Edit Organization"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Link> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
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
