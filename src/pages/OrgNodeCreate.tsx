import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { storage } from '@/utils/storage';
import { NodeOnboardingStepper } from '@/components/ui/custom/NodeOnboardingStepper';
import { UserPlus, Server, Info, ArrowRight } from 'lucide-react';
import { NodeApiService } from '@/api/nodes';

const OrgNodeCreate: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

    try {
      const data = await NodeApiService.createNode(organizationUuid, formData);
      
      // Navigate to the newly created node page
      if (data && data.uuid) {
        navigate(`/organizations/${slug}/nodes/${data.uuid}`);
      } else {
        navigate(`/organizations/${slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <NodeOnboardingStepper currentStep="add" />
          
          {/* Node Information Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
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
          </div>

          {/* Create Node Form Card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Node Configuration</h3>
              <p className="text-muted-foreground">
                Enter the details for your new node below.
              </p>
            </div>

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
                  disabled={isLoading || !formData.name.trim() || !formData.address.trim() || !ownershipConfirmed}
                  size="lg"
                  className="px-8"
                >
                  <Server className="h-5 w-5 mr-2" />
                  {isLoading ? 'Creating...' : 'Create Node'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgNodeCreate;