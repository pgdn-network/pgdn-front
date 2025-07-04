import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';

const Orchestrations: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Orchestrations' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">Orchestrations</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage automated scanning configurations and workflows
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Create Orchestration
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Run
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Run
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
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Daily Network Scan
                            </div>
                            <div className="text-sm text-gray-500">
                              Full network discovery
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Daily at 2:00 AM
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 hours ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        In 22 hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-green-600 hover:text-green-900">Run Now</button>
                        <button className="text-red-600 hover:text-red-900">Disable</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Weekly Deep Scan
                            </div>
                            <div className="text-sm text-gray-500">
                              Comprehensive security scan
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Paused
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Weekly on Sunday
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        3 days ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Paused
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-green-600 hover:text-green-900">Resume</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Node Health Check
                            </div>
                            <div className="text-sm text-gray-500">
                              Monitor node availability
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Every 15 minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        5 minutes ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        In 10 minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-green-600 hover:text-green-900">Run Now</button>
                        <button className="text-red-600 hover:text-red-900">Disable</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Create */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Create Orchestration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Orchestration name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Network Scan</option>
                  <option>Security Audit</option>
                  <option>Performance Check</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Every 15 minutes</option>
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Custom</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add workflow builder */}
        {/* TODO: Add trigger conditions */}
        {/* TODO: Add notification settings */}
        {/* TODO: Add execution history */}
      </div>
    </div>
  );
};

export default Orchestrations;
