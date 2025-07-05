import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { storage } from '@/utils/storage';

const NodeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    organization_uuid: ''
  });

  // Auto-select organization if there's only one
  useEffect(() => {
    if (organizations.length === 1 && !formData.organization_uuid) {
      setFormData(prev => ({
        ...prev,
        organization_uuid: organizations[0].uuid
      }));
    }
  }, [organizations, formData.organization_uuid]);

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
      const token = storage.getAccessToken();
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`http://localhost:8000/api/v1/organizations/${formData.organization_uuid}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create node: ${response.status}`);
      }

      await response.json();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Create New Node</h1>
        <p className="text-lg text-secondary mt-2">Add a new node to your network</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Node Details</CardTitle>
          <CardDescription>
            Configure your new node settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Node Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Mainnet Validator Node"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Node Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., sui.dev.pgdn.network"
                required
                disabled={isLoading}
              />
            </div>

            {organizations.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select value={formData.organization_uuid} onValueChange={handleOrgChange} required>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Organization</Label>
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm">{organizations[0].name}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.organization_uuid}
              >
                {isLoading ? 'Creating...' : 'Create Node'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeCreate;