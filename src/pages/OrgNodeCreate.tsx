import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { NodeOnboardingStepper } from '@/components/ui/custom/NodeOnboardingStepper';
import { ProtocolSelectModal } from '@/components/ui/custom/ProtocolSelectModal';
import { Server, Info, ArrowRight, Plus, X } from 'lucide-react';
import { NodeApiService } from '@/api/nodes';
import type { ClaimableNodeError, ClaimNodeResponse } from '@/types/node';
import type { Protocol as ContextProtocol } from '@/contexts/ProtocolsContext';

const OrgNodeCreate: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const { protocols, loading: protocolsLoading } = useProtocols();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimable, setClaimable] = useState<ClaimableNodeError | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimNodeResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [selectedProtocols, setSelectedProtocols] = useState<ContextProtocol[]>([]);
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  // Find organization UUID from slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProtocolSelect = (modalProtocols: { id: string; name: string; description?: string }[]) => {
    // Convert back to ContextProtocol format
    const contextProtocols = modalProtocols.map(p => 
      protocols.find(cp => cp.uuid === p.id)
    ).filter(Boolean) as ContextProtocol[];
    
    setSelectedProtocols(contextProtocols);
    setShowProtocolModal(false);
  };

  const removeProtocol = (protocolId: string) => {
    setSelectedProtocols(prev => prev.filter(p => p.uuid !== protocolId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setClaimable(null);
    setClaimResult(null);

    if (!ownershipConfirmed) {
      setError('You must confirm that you own or control this node before proceeding.');
      setIsLoading(false);
      return;
    }

    if (!organizationUuid) {
      setError('Organization not found');
      setIsLoading(false);
      return;
    }

    if (selectedProtocols.length === 0) {
      setError('Please select at least one protocol for your node.');
      setIsLoading(false);
      return;
    }

    try {
      const nodeData = {
        ...formData,
        protocol_uuid: selectedProtocols[0].uuid // Use the first selected protocol
      };
      
      const data = await NodeApiService.createNode(organizationUuid, nodeData);
      
      // Navigate to the discovery page for new nodes
      if (data && data.node && data.node.uuid) {
        navigate(`/organizations/${slug}/nodes/${data.node.uuid}/discovery`);
      } else {
        navigate(`/organizations/${slug}`);
      }
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.detail?.error) {
        setClaimable(err.response.data.detail as ClaimableNodeError);
      } else {
        // Extract error message from API response
        let errorMessage = 'An error occurred';
        if (err?.response?.data?.detail) {
          if (Array.isArray(err.response.data.detail)) {
            // Handle validation errors array
            errorMessage = err.response.data.detail.map((error: any) => error.msg).join(', ');
          } else {
            errorMessage = err.response.data.detail;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
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
      // Extract error message from API response
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to claim node';
      setError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Organization Not Found</h2>
              <p className="text-muted-foreground">
                The organization you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <NodeOnboardingStepper currentStep="add" />
          
          {/* Node Information Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">What is a Node?</h3>
                <p className="text-muted-foreground mb-4">
                  A node is a server or device that participates in your DePIN network. It can:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                    Process transactions and validate blocks
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                    Store data and provide network services
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                    Contribute to network security and consensus
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Create Node Form Card */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Node Configuration</h3>
              <p className="text-muted-foreground">
                Enter the details for your new node below.
              </p>
            </div>

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
                  <Label htmlFor="name" className="text-sm font-medium">Node Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mainnet Validator Node"
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Node Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., sui.dev.pgdn.network"
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {/* Protocol Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Protocols</Label>
                    <span className="text-xs text-muted-foreground">
                      {selectedProtocols.length}/3 selected
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProtocolModal(true)}
                    disabled={isLoading || protocolsLoading}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {selectedProtocols.length === 0 
                      ? `Select protocols for your node (${protocols.length} available)` 
                      : `${selectedProtocols.length} protocol${selectedProtocols.length !== 1 ? 's' : ''} selected`
                    }
                  </Button>

                  {/* Selected Protocols Display */}
                  {selectedProtocols.length > 0 && (
                    <div className="space-y-2">
                      {selectedProtocols.map((protocol) => (
                        <div
                          key={protocol.uuid}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Server className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{protocol.display_name}</p>
                              <p className="text-xs text-muted-foreground">{protocol.category}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProtocol(protocol.uuid)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3 p-4 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 rounded-lg">
                    <Checkbox
                      id="ownership"
                      checked={ownershipConfirmed}
                      onCheckedChange={(checked) => setOwnershipConfirmed(checked as boolean)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor="ownership" 
                        className="text-sm font-medium text-orange-800 dark:text-orange-200 cursor-pointer"
                      >
                        Ownership Confirmation
                      </Label>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        I confirm that I am authorized to register and scan this node.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/organizations/${slug}`)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isLoading || 
                      !formData.name.trim() || 
                      !formData.address.trim() || 
                      !ownershipConfirmed ||
                      selectedProtocols.length === 0
                    }
                    size="lg"
                    className="px-8"
                  >
                    <Server className="h-5 w-5 mr-2" />
                    {isLoading ? 'Creating...' : 'Create Node'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* Protocol Selection Modal */}
      <ProtocolSelectModal
        isOpen={showProtocolModal}
        onClose={() => setShowProtocolModal(false)}
        onSelect={handleProtocolSelect}
        protocols={protocols.map(p => ({
          id: p.uuid,
          name: p.display_name,
          description: `${p.category} protocol`
        }))}
        maxSelection={3}
      />
    </div>
  );
};

export default OrgNodeCreate;