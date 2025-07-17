import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ... existing code ...
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { useProtocols } from '@/contexts/ProtocolsContext';
import { NodeApiService } from '@/api/nodes';
import type { Node } from '@/types/node';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { NodeTabNav } from '@/components/ui/custom/NodeTabNav';

const OrgNodeSettings: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const navigate = useNavigate();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { addNotification } = useNotifications();
  const { getProtocol, protocols } = useProtocols();
  
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    active: true,
    network: '',
    nodeType: '',
    protocols: [] as string[], // Array of protocol UUIDs
    scanFrequency: 'daily',
    scanLevel: 'standard',
    enableNotifications: true,
    enableAutoRemediation: false,
    enableDeepScan: true,
    enableParallelProcessing: false,
    notes: ''
  });

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchNode = async () => {
      if (!organizationUuid || !nodeId) return;
      
      try {
        setLoading(true);
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeId);
        setNode(nodeData);
        
        // Initialize form data with node data
        setFormData({
          name: nodeData.name || '',
          address: nodeData.address || '',
          active: nodeData.active ?? true,
          network: nodeData.network || '',
          nodeType: nodeData.node_type || '',
          protocols: Array.isArray(nodeData.protocols) ? nodeData.protocols : 
                    (Array.isArray(nodeData.node_protocols) ? nodeData.node_protocols : 
                    (nodeData.protocol_details?.uuid ? [nodeData.protocol_details.uuid] : [])),
          scanFrequency: 'daily', // Default value
          scanLevel: 'standard', // Default value
          enableNotifications: true, // Default value
          enableAutoRemediation: false, // Default value
          enableDeepScan: true, // Default value
          enableParallelProcessing: false, // Default value
          notes: nodeData.meta?.notes || ''
        });
      } catch (err) {
        console.error('Failed to fetch node:', err);
        setError('Failed to load node data');
      } finally {
        setLoading(false);
      }
    };

    if (organizationUuid && nodeId) {
      fetchNode();
    }
  }, [organizationUuid, nodeId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationUuid || !nodeId) return;
    
    setSaving(true);
    try {
      // Prepare the data to send to the API
      const updateData = {
        name: formData.name,
        active: formData.active,
        network: formData.network,
        node_type: formData.nodeType,
        node_protocols: formData.protocols,
        meta: {
          ...node?.meta,
          notes: formData.notes,
          scan_frequency: formData.scanFrequency,
          scan_level: formData.scanLevel,
          enable_notifications: formData.enableNotifications,
          enable_auto_remediation: formData.enableAutoRemediation,
          enable_deep_scan: formData.enableDeepScan,
          enable_parallel_processing: formData.enableParallelProcessing
        }
      };

      const updatedNode = await NodeApiService.patchNode(organizationUuid, nodeId, updateData);
      setNode(updatedNode);
      
      addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Node settings have been saved successfully.',
        duration: 5000
      });
    } catch (err) {
      console.error('Failed to update node:', err);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to save node settings. Please try again.',
        duration: 7000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/organizations/${slug}/nodes/${nodeId}`);
  };

  // Get protocol information for logo - check protocols array first, then node_protocols, then protocol_details
  const protocolUuid = node?.protocols?.[0] || node?.node_protocols?.[0] || node?.protocol_details?.uuid;
  const protocol = protocolUuid ? getProtocol(protocolUuid) : null;
  
  // Get logo based on protocol name
  const getLogo = (protocolName: string) => {
    const normalizedName = protocolName.toLowerCase();
    if (normalizedName.includes('sui')) {
      return '/sui-logo.svg';
    }
    // Add more protocol logos as they become available
    return null;
  };

  // Extract network and node type from node data - they're at the root level
  const network = node?.network;
  const nodeType = node?.node_type;
  
  const logo = protocol ? getLogo(protocol.name) : null;

  if (loading || orgsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading node settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!orgsLoading && !organization)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Node</h2>
            <p className="text-gray-500 mb-4">
              {error || (!orgsLoading && !organization ? 'Organization not found' : 'Unknown error')}
            </p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {logo && (
                <img 
                  src={logo} 
                  alt={`${protocol?.display_name || 'Protocol'} logo`}
                  className="h-8 w-8"
                />
              )}
              <h1 className="text-2xl font-bold text-foreground">Node Settings</h1>
            </div>
            {/* Badges for network, node type, and protocol */}
            <div className="flex flex-wrap gap-2 mb-4">
              {network && (
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold 
                    ${network === 'mainnet' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}`}
                >
                  {network}
                </span>
              )}
              {nodeType && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold 
                          ${nodeType === 'validator' ? 'bg-blue-600 text-white' : ''}
                          ${nodeType === 'public_rpc' ? 'bg-purple-600 text-white' : ''}
                          ${nodeType === 'hybrid' ? 'bg-teal-600 text-white' : ''}
                        `}
                      >
                        {nodeType}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {nodeType === 'validator' && 'This node is a validator, responsible for consensus and block production.'}
                      {nodeType === 'public_rpc' && 'This node provides public RPC access for the network.'}
                      {nodeType === 'hybrid' && 'This node acts as both a validator and a public RPC node.'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* Protocol Badge */}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold 
                  ${protocol ? 'bg-indigo-600 text-white' : 'bg-gray-400 text-white'}`}
              >
                {protocol?.display_name || 'Unknown Protocol'}
              </span>
            </div>
            {(!network && !nodeType) && (
              <p className="text-muted-foreground">
                Configure settings for {node?.name || 'this node'}
              </p>
            )}
          </div>
        </div>
        {/* Node Tab Bar */}
        {organization && nodeId && (
          <NodeTabNav organizationSlug={organization.slug} nodeId={nodeId} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details of this node
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Node Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter node name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    disabled
                    placeholder="Node address cannot be changed"
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nodeType">Node Type</Label>
                <Select value={formData.nodeType} onValueChange={(value) => handleInputChange('nodeType', value)}>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="public_rpc">Public RPC</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Protocol Selection */}
              <div className="space-y-2">
                <Label htmlFor="protocols">Protocol</Label>
                <Select 
                  value={formData.protocols[0] || 'none'} 
                  onValueChange={(value) => handleInputChange('protocols', value === 'none' ? [] : [value])}
                  disabled={node?.simple_state !== 'new'}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder={formData.protocols.length === 0 ? "Select protocol (Unknown)" : "Select protocol"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Protocol</SelectItem>
                    {protocols.map((protocol) => (
                      <SelectItem key={protocol.uuid} value={protocol.uuid}>
                        {protocol.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {node?.simple_state !== 'new' ? (
                  <p className="text-sm text-muted-foreground">
                    Protocol can only be changed for nodes in 'new' state. Current state: {node?.simple_state}
                  </p>
                ) : formData.protocols.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Current protocol is unknown. Select a protocol to update it.
                  </p>
                ) : null}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Active Node</Label>
              </div>
            </CardContent>
          </Card>

          {/* Scan Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Configuration</CardTitle>
              <CardDescription>
                Configure how this node should be scanned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Scan Frequency</Label>
                <RadioGroup
                  value={formData.scanFrequency}
                  onValueChange={(value) => handleInputChange('scanFrequency', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Scan Level</Label>
                <RadioGroup
                  value={formData.scanLevel}
                  onValueChange={(value) => handleInputChange('scanLevel', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comprehensive" id="comprehensive" />
                    <Label htmlFor="comprehensive">Comprehensive</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Scan Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDeepScan"
                      checked={formData.enableDeepScan}
                      onCheckedChange={(checked) => handleInputChange('enableDeepScan', checked)}
                    />
                    <Label htmlFor="enableDeepScan">Enable Deep Scan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableParallelProcessing"
                      checked={formData.enableParallelProcessing}
                      onCheckedChange={(checked) => handleInputChange('enableParallelProcessing', checked)}
                    />
                    <Label htmlFor="enableParallelProcessing">Enable Parallel Processing</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Automation */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Automation</CardTitle>
              <CardDescription>
                Configure notification and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Notification Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableNotifications"
                      checked={formData.enableNotifications}
                      onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
                    />
                    <Label htmlFor="enableNotifications">Enable Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAutoRemediation"
                      checked={formData.enableAutoRemediation}
                      onCheckedChange={(checked) => handleInputChange('enableAutoRemediation', checked)}
                    />
                    <Label htmlFor="enableAutoRemediation">Enable Auto-Remediation</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Add any additional notes about this node
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any notes about this node..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgNodeSettings; 