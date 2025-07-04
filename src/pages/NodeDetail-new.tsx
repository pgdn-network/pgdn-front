import React from 'react';
import { useParams } from 'react-router-dom';
import { Server, Activity, Shield, Settings, Play, BarChart3, Clock, MapPin } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';

const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Nodes', href: '/nodes' },
    { label: id || 'Node' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Server className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Node: {id}</h1>
                  <p className="mt-1 text-sm text-gray-500-foreground">
                    Detailed information and metrics for this node
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <Button variant="default">
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Status Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Node Status</h2>
              <Activity className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Status:</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Type:</span>
                <span className="text-sm text-foreground">Edge Node</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Version:</span>
                <span className="text-sm text-foreground">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Uptime:</span>
                <span className="text-sm text-foreground">15 days, 4 hours</span>
              </div>
            </div>
          </Card>

          {/* Location Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Location</h2>
              <MapPin className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Country:</span>
                <span className="text-sm text-foreground">United States</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Region:</span>
                <span className="text-sm text-foreground">US-West-2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">IP Address:</span>
                <span className="text-sm text-foreground">192.168.1.100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Port:</span>
                <span className="text-sm text-foreground">8080</span>
              </div>
            </div>
          </Card>

          {/* Performance Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Performance</h2>
              <BarChart3 className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">CPU Usage:</span>
                <span className="text-sm text-foreground">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Memory:</span>
                <span className="text-sm text-foreground">2.1 GB / 4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Network:</span>
                <span className="text-sm text-foreground">125 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500-foreground">Latency:</span>
                <span className="text-sm text-foreground">23ms</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Clock className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Node started successfully</p>
                  <p className="text-xs text-gray-500-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Configuration updated</p>
                  <p className="text-xs text-gray-500-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Security scan completed</p>
                  <p className="text-xs text-gray-500-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Security Status</h2>
              <Shield className="h-5 w-5 text-gray-500-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Security Level:</span>
                <Badge variant="success">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Last Scan:</span>
                <span className="text-sm text-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Vulnerabilities:</span>
                <Badge variant="secondary">0 Found</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500-foreground">Firewall:</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
