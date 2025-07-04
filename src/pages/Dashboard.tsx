import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';

const Dashboard: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Dashboard' }
  ];

  // Mock data for nodes
  const mockNodes = [
    {
      id: 'node-1',
      name: 'DePIN Node Alpha',
      type: 'Storage',
      status: 'Online',
      location: 'New York, NY',
      uptime: '99.9%',
      lastSeen: '2 minutes ago'
    },
    {
      id: 'node-2',
      name: 'DePIN Node Beta',
      type: 'Compute',
      status: 'Online',
      location: 'San Francisco, CA',
      uptime: '98.7%',
      lastSeen: '1 minute ago'
    },
    {
      id: 'node-3',
      name: 'DePIN Node Gamma',
      type: 'Network',
      status: 'Offline',
      location: 'Austin, TX',
      uptime: '95.2%',
      lastSeen: '2 hours ago'
    },
    {
      id: 'node-4',
      name: 'DePIN Node Delta',
      type: 'Storage',
      status: 'Online',
      location: 'Miami, FL',
      uptime: '99.5%',
      lastSeen: '30 seconds ago'
    },
    {
      id: 'node-5',
      name: 'DePIN Node Echo',
      type: 'Compute',
      status: 'Warning',
      location: 'Seattle, WA',
      uptime: '97.8%',
      lastSeen: '5 minutes ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-green-100 text-green-800';
      case 'Offline':
        return 'bg-red-100 text-red-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your DePIN network monitoring
        </p>
      </div>
        
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metrics Cards Placeholder */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Organizations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        3
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Nodes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        46
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Nodes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        41
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Alerts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        2
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Nodes Section */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Nodes</h2>
                <Link
                  to="/nodes"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all nodes
                </Link>
              </div>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/nodes/${node.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {node.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {node.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(node.status)}`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {node.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {node.uptime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {node.lastSeen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <p className="mt-2 text-sm text-gray-600">
              Latest network monitoring activities will appear here
            </p>
            {/* TODO: Add activity feed */}
            {/* TODO: Add charts/graphs */}
            {/* TODO: Add quick actions */}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
