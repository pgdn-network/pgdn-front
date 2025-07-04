import React from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';

const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Nodes', href: '/nodes' },
    { label: id || 'Node' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">Node: {id}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Detailed information and metrics for this node
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Start Scan
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Settings
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Node Status Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Node Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Type:</span>
                <span className="text-sm text-gray-900">Storage Node</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Seen:</span>
                <span className="text-sm text-gray-900">2 minutes ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Uptime:</span>
                <span className="text-sm text-gray-900">99.8%</span>
              </div>
            </div>
          </div>
          
          {/* Node Metrics Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">CPU Usage:</span>
                <span className="text-sm text-gray-900">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Memory:</span>
                <span className="text-sm text-gray-900">2.1GB / 4GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Storage:</span>
                <span className="text-sm text-gray-900">120GB / 500GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Network:</span>
                <span className="text-sm text-gray-900">1.2 Mbps</span>
              </div>
            </div>
          </div>
          
          {/* Node Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Node Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IP Address:</span>
                <span className="text-sm text-gray-900">192.168.1.100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Port:</span>
                <span className="text-sm text-gray-900">8080</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Location:</span>
                <span className="text-sm text-gray-900">New York, US</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Version:</span>
                <span className="text-sm text-gray-900">v1.2.3</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-900">Node started successfully</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-900">Health check passed</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-sm text-gray-900">Storage usage increased</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add real-time metrics charts */}
        {/* TODO: Add logs viewer */}
        {/* TODO: Add configuration management */}
        {/* TODO: Add alert management */}
      </div>
    </div>
  );
};

export default NodeDetail;
