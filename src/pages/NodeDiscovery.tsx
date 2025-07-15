import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NodeApiService } from '@/api/nodes';
import { formatErrorMessage } from '@/utils/errorHandling';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { 
  Server, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Globe,
  Activity,
  Shield,
  ArrowRight
} from 'lucide-react';
import type { Node } from '@/types/node';

const NodeDiscovery: React.FC = () => {
  const { slug, nodeUuid } = useParams<{ slug: string; nodeUuid: string }>();
  const navigate = useNavigate();
  const { organizations } = useOrganizations();
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const organization = organizations.find(org => org.slug === slug);

  useEffect(() => {
    if (!organization?.uuid || !nodeUuid) return;
    
    const fetchNode = async () => {
      try {
        setLoading(true);
        setError(null);
        const nodeData = await NodeApiService.getNode(organization.uuid, nodeUuid);
        setNode(nodeData);
      } catch (err: any) {
        setError(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [organization?.uuid, nodeUuid]);

  const handleRefresh = async () => {
    if (!organization?.uuid || !nodeUuid) return;
    
    try {
      setRefreshing(true);
      setError(null);
      const nodeData = await NodeApiService.getNode(organization.uuid, nodeUuid);
      setNode(nodeData);
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!node) return <Clock className="h-5 w-5" />;
    
    switch (node.discovery_status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (!node) return 'bg-yellow-100 text-yellow-800';
    
    switch (node.discovery_status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    if (!node) return 'Loading...';
    
    switch (node.discovery_status) {
      case 'COMPLETED':
        return 'Discovery Complete';
      case 'FAILED':
        return 'Discovery Failed';
      case 'PENDING':
      default:
        return 'Discovery in Progress';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading node discovery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => navigate(`/organizations/${slug}`)}>
                Back to Organization
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Alert>
              <AlertDescription>Node not found</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Check if we should show this page
  const shouldShowDiscovery = 
    (node.discovery_status === 'PENDING' || node.discovery_status === 'FAILED') && 
    node.simple_state === 'NEW';

  if (!shouldShowDiscovery) {
    // Redirect to node detail page
    navigate(`/organizations/${slug}/nodes/${nodeUuid}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Node Discovery</h1>
                <p className="text-muted-foreground mt-2">
                  We're analyzing your node to understand its configuration and protocols
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Node Info Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{node.name}</h2>
                    <p className="text-muted-foreground">{node.address}</p>
                  </div>
                </div>
                <Badge className={getStatusColor()}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    {getStatusText()}
                  </div>
                </Badge>
              </div>
            </Card>
          </div>

          {/* Discovery Status */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Discovery Progress */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Discovery Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network Analysis</span>
                    <span>{node.discovery_status === 'COMPLETED' ? '100%' : '75%'}</span>
                  </div>
                  <Progress value={node.discovery_status === 'COMPLETED' ? 100 : 75} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Protocol Detection</span>
                    <span>{node.discovery_status === 'COMPLETED' ? '100%' : '50%'}</span>
                  </div>
                  <Progress value={node.discovery_status === 'COMPLETED' ? 100 : 50} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Security Assessment</span>
                    <span>{node.discovery_status === 'COMPLETED' ? '100%' : '25%'}</span>
                  </div>
                  <Progress value={node.discovery_status === 'COMPLETED' ? 100 : 25} className="h-2" />
                </div>
              </div>
            </Card>

            {/* What's Happening */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">What's Happening</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Network Connectivity</p>
                    <p className="text-xs text-muted-foreground">Verifying node accessibility and network routes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Protocol Analysis</p>
                    <p className="text-xs text-muted-foreground">Detecting supported protocols and services</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Security Scanning</p>
                    <p className="text-xs text-muted-foreground">Analyzing security posture and vulnerabilities</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Status Messages */}
          {node.discovery_status === 'FAILED' && (
            <Card className="p-6 mt-6 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Discovery Failed</h3>
                  <p className="text-red-700 text-sm mb-4">
                    We encountered issues while analyzing your node. This could be due to network connectivity problems, 
                    firewall restrictions, or the node being temporarily unavailable.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh}>
                      Retry Discovery
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/organizations/${slug}/nodes/${nodeUuid}`)}
                    >
                      View Node Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {node.discovery_status === 'PENDING' && (
            <Card className="p-6 mt-6 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Discovery in Progress</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    We're actively analyzing your node. This process typically takes 2-5 minutes depending on 
                    network conditions and node complexity. You can refresh this page to check the latest status.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate(`/organizations/${slug}/nodes/${nodeUuid}`)}
                      className="flex items-center gap-2"
                    >
                      View Node Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Next Steps</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h4 className="font-medium mb-2">Discovery Complete</h4>
                <p className="text-sm text-muted-foreground">Node analysis and protocol detection</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h4 className="font-medium mb-2">Security Scan</h4>
                <p className="text-sm text-muted-foreground">Comprehensive vulnerability assessment</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <h4 className="font-medium mb-2">Monitoring</h4>
                <p className="text-sm text-muted-foreground">Ongoing security monitoring and alerts</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NodeDiscovery; 