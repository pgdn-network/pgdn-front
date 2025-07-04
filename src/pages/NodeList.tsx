import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';

const NodeList: React.FC = () => {
  const handleAddNode = () => {
    alert('To add a node, please select an organization first. Go to Organizations > Select Org > Add Node');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Nodes' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">All Network Nodes</h1>
              <p className="mt-2 text-sm text-gray-600">
                Monitor and manage all nodes across all organizations
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button 
                onClick={handleAddNode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Node
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Node ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Seen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Placeholder rows */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to="/nodes/sample-node-1" className="text-blue-600 hover:text-blue-900">
                          node-001
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link to="/organizations" className="text-blue-600 hover:text-blue-900">
                          TechCorp Inc.
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Storage
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 minutes ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to="/nodes/sample-node-1" className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to="/nodes/sample-node-2" className="text-blue-600 hover:text-blue-900">
                          node-002
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link to="/organizations" className="text-blue-600 hover:text-blue-900">
                          DataFlow Systems
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Offline
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Compute
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1 hour ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to="/nodes/sample-node-2" className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add pagination */}
        {/* TODO: Add search and filters */}
        {/* TODO: Add bulk actions */}
        {/* TODO: Add real-time status updates */}
      </div>
    </div>
  );
};

export default NodeList;
