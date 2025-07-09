import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import type { ClaimableNodeError, ClaimNodeResponse } from '@/types/node';

const NodeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimable, setClaimable] = useState<ClaimableNodeError | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimNodeResponse | null>(null);
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
    setClaimable(null);
    setClaimResult(null);

    try {
      await NodeApiService.createNode(formData.organization_uuid, {
        name: formData.name,
        address: formData.address
      });
      navigate('/');
    } catch (err: any) {
      // Try to parse claimable node error
      if (err?.response?.status === 409 && err?.response?.data?.detail?.error) {
        setClaimable(err.response.data.detail as ClaimableNodeError);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!claimable) return;
    setClaiming(true);
    setError(null);
    try {
      const result = await NodeApiService.claimNode(claimable.claim_endpoint);
      setClaimResult(result);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to claim node');
    } finally {
      setClaiming(false);
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
          {claimable ? (
            <div className="space-y-6">
              {/* If claim was successful, show only the claim result and validation instructions */}
              {claimResult && claimResult.success ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
                  <div className="font-semibold mb-2">{claimResult.message}</div>
                  <div className="mb-2">Node: {claimResult.node_name} ({claimResult.node_address})</div>
                  <div className="mb-2">Status: {claimResult.status}</div>
                  {/* Validation instructions (reuse ValidationModal content) */}
                  <div className="space-y-4 mt-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {/* Shield icon */}
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z" /></svg>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Node Validation Required</h3>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Validation Process:</h4>
                      <p className="text-xs text-gray-900 dark:text-white font-normal leading-relaxed">
                        Node validation ensures that your target is reachable and properly configured for scanning. This process verifies network connectivity, protocol compatibility, and security policies.
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-900 dark:text-white mb-4">
                        To proceed with validation, please visit our validation portal:
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('https://pgdn.network/validation', '_blank')}
                      >
                        {/* ExternalLink icon */}
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        Go to Validation Portal
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="font-semibold mb-2">{claimable.error}</div>
                      <div className="mb-2">A public node with this address already exists and can be claimed.</div>
                      <div className="mb-2">
                        <b>Node:</b> {claimable.existing_node.name} ({claimable.existing_node.address})<br />
                        <b>Status:</b> {claimable.existing_node.claim_status}
                      </div>
                      <div className="mb-2 text-sm text-muted-foreground">{claimable.suggestion}</div>
                      {error && (
                        <div className="text-danger font-semibold mt-2">{error}</div>
                      )}
                      <div className="flex flex-col gap-2 mt-4">
                        <Button onClick={handleClaim} disabled={claiming} className="w-full">
                          {claiming ? 'Claiming...' : 'Claim this Node'}
                        </Button>
                        <Button variant="outline" onClick={() => { setClaimable(null); setFormData({ ...formData, address: '' }); setError(null); }} className="w-full">
                          Add a different node address
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeCreate;