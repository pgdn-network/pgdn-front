import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSlug?: string; // Optional - if provided, will pre-select this organization
  onSuccess?: () => void; // Optional callback when node is created successfully
}

export const CreateNodeModal: React.FC<CreateNodeModalProps> = ({
  isOpen,
  onClose,
  organizationSlug,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    organization_uuid: ''
  });

  // Auto-select organization when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let targetOrgUuid = '';
    
    if (organizationSlug) {
      // Find organization by slug
      const org = organizations.find(org => org.slug === organizationSlug);
      targetOrgUuid = org?.uuid || '';
    } else if (organizations.length === 1) {
      // Auto-select if there's only one organization
      targetOrgUuid = organizations[0].uuid;
    }

    if (targetOrgUuid && targetOrgUuid !== formData.organization_uuid) {
      setFormData(prev => ({
        ...prev,
        organization_uuid: targetOrgUuid
      }));
    }
  }, [isOpen, organizations, organizationSlug, formData.organization_uuid]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', address: '', organization_uuid: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrgChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      organization_uuid: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await NodeApiService.createNode(formData.organization_uuid, {
        name: formData.name,
        address: formData.address
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
      
      // Navigate to the organization's node list if we have a slug
      if (organizationSlug) {
        navigate(`/organizations/${organizationSlug}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage = err?.response?.data?.detail || err?.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 border-0 w-96 max-w-md">
        <Card className="shadow-2xl border border-border bg-surface rounded-2xl">
          <div className="p-6">
            <h3 className="text-xl font-bold text-primary mb-6">
              Create New Node
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                  Node Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mainnet Validator Node"
                  required
                  disabled={isLoading}
                  className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="block text-sm font-medium text-primary mb-2">
                  Node Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., sui.dev.pgdn.network"
                  required
                  disabled={isLoading}
                  className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary"
                />
              </div>

              {organizations.length > 1 && (
                <div>
                  <Label htmlFor="organization" className="block text-sm font-medium text-primary mb-2">
                    Organization
                  </Label>
                  <Select value={formData.organization_uuid} onValueChange={handleOrgChange} required>
                    <SelectTrigger className="w-full border border-border rounded-xl px-3 py-2 bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.uuid} value={org.uuid}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {organizations.length === 1 && (
                <div>
                  <Label className="block text-sm font-medium text-primary mb-2">
                    Organization
                  </Label>
                  <div className="p-2 bg-surface-secondary rounded-xl border border-border">
                    <span className="text-sm text-primary">{organizations[0].name}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading || !formData.organization_uuid}
                >
                  {isLoading ? 'Creating...' : 'Create Node'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}; 