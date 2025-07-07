import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/custom/DataTable';
import { Badge } from '@/components/ui/custom/Badge';
import { Button } from '@/components/ui/button';


const NodeList: React.FC = () => {
  const handleAddNode = () => {
    alert('To add a node, please select an organization first. Go to Organizations > Select Org > Add Node');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Nodes' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">All Network Nodes</h1>
          <p className="text-secondary max-w-2xl mt-2">Monitor and manage all nodes across all organizations</p>
        </div>
        <Button variant="default" onClick={handleAddNode}>
          Add Node
        </Button>
      </div>

      {/* Table Section */}
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node ID</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Placeholder rows */}
            <TableRow>
                                <TableCell>
                    <Link to="/organizations/techcorp/nodes/sample-node-1" className="text-link font-medium underline underline-offset-2 hover:text-link-hover transition-colors">
                      node-001
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/organizations" className="text-link font-medium underline underline-offset-2 hover:text-link-hover transition-colors">
                      TechCorp Inc.
                    </Link>
                  </TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>Storage</TableCell>
              <TableCell>2 minutes ago</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/organizations/techcorp/nodes/sample-node-1">View</Link>
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
                                <TableCell>
                    <Link to="/organizations/dataflow/nodes/sample-node-2" className="text-link font-medium underline underline-offset-2 hover:text-link-hover transition-colors">
                      node-002
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/organizations" className="text-link font-medium underline underline-offset-2 hover:text-link-hover transition-colors">
                      DataFlow Systems
                    </Link>
                  </TableCell>
              <TableCell>
                <Badge variant="destructive">Offline</Badge>
              </TableCell>
              <TableCell>Compute</TableCell>
              <TableCell>1 hour ago</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/organizations/dataflow/nodes/sample-node-2">View</Link>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      {/* TODO: Add pagination, search, filters, bulk actions, real-time status updates */}
    </div>
  );
};

export default NodeList;
