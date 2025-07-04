import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';

const OrgNodeList: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [formData, setFormData] = useState({
    nodeId: '',
    type: 'storage',
    ipAddress: '',
    port: '8080'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    type: 'enterprise'
  });

  const handleAddNode = () => {
    setShowAddNodeModal(true);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleEditOrg = () => {
    // Pre-populate form with current org data
    setEditFormData({
      name: orgName,
      description: 'Sample organization description',
      type: 'enterprise'
    });
    setShowEditOrgModal(true);
  };

  const handleSaveNode = () => {
    // TODO: Implement API call to add node
    console.log('Adding node to organization:', orgId, formData);
    alert(`Added node ${formData.nodeId} to organization`);
    setShowAddNodeModal(false);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleSaveOrg = () => {
    // TODO: Implement API call to update organization
    console.log('Updating organization:', orgId, editFormData);
    alert(`Updated organization: ${editFormData.name}`);
    setShowEditOrgModal(false);
  };

  const handleCloseModal = () => {
    setShowAddNodeModal(false);
    setFormData({ nodeId: '', type: 'storage', ipAddress: '', port: '8080' });
  };

  const handleCloseEditModal = () => {
    setShowEditOrgModal(false);
  };
  
  // Mock organization data - in real app this would come from API
  const orgName = orgId === '550e8400-e29b-41d4-a716-446655440000' ? 'TechCorp Inc.' :
                  orgId === '6ba7b810-9dad-11d1-80b4-00c04fd430c8' ? 'DataFlow Systems' :
                  orgId === '6ba7b811-9dad-11d1-80b4-00c04fd430c8' ? 'CloudNet Solutions' :
                  'Unknown Organization';
  
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Organizations', href: '/organizations' },
    { label: orgName }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">{orgName}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Organization overview and node management
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button 
                onClick={handleEditOrg}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Edit Organization
              </button>
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
                    {/* Placeholder rows - these would be filtered by organization */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/organization/${orgId}/nodes/node-001`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          node-001
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
                        <Link 
                          to={`/organization/${orgId}/nodes/node-001`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/organization/${orgId}/nodes/node-002`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          node-002
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
                        <Link 
                          to={`/organization/${orgId}/nodes/node-002`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/organization/${orgId}/nodes/node-003`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          node-003
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Network
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        5 minutes ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/organization/${orgId}/nodes/node-003`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
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
        
        {/* Organization Node Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        {orgName === 'TechCorp Inc.' ? '23' : 
                         orgName === 'DataFlow Systems' ? '15' : 
                         orgName === 'CloudNet Solutions' ? '8' : '0'}
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
                        {orgName === 'TechCorp Inc.' ? '21' : 
                         orgName === 'DataFlow Systems' ? '14' : 
                         orgName === 'CloudNet Solutions' ? '6' : '0'}
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
                        Offline Nodes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {orgName === 'TechCorp Inc.' ? '2' : 
                         orgName === 'DataFlow Systems' ? '1' : 
                         orgName === 'CloudNet Solutions' ? '2' : '0'}
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
                    <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Uptime
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {orgName === 'TechCorp Inc.' ? '99.2%' : 
                         orgName === 'DataFlow Systems' ? '98.7%' : 
                         orgName === 'CloudNet Solutions' ? '97.1%' : '0%'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add organization-specific node filtering */}
        {/* TODO: Add bulk node operations */}
        {/* TODO: Add node creation within organization */}
        {/* TODO: Add organization-specific node settings */}
      </div>
      
      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Node to {orgName}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node ID
                  </label>
                  <input
                    type="text"
                    value={formData.nodeId}
                    onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter node ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Node Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="storage">Storage</option>
                    <option value="compute">Compute</option>
                    <option value="network">Network</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="text"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8080"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Organization Modal */}
      {showEditOrgModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Organization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter organization description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Type
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="enterprise">Enterprise</option>
                    <option value="startup">Startup</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOrg}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgNodeList;
