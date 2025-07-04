import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';

const Scans: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    alert('Starting new network scan...');
    // Simulate scan completion
    setTimeout(() => {
      setIsScanning(false);
      alert('Scan completed!');
    }, 3000);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    alert('Scan stopped!');
  };

  const handleViewScan = (scanId: string) => {
    alert(`Viewing scan details for: ${scanId}`);
  };

  const handleDownloadScan = (scanId: string) => {
    alert(`Downloading scan results for: ${scanId}`);
  };

  const handleRetryScan = (scanId: string) => {
    alert(`Retrying scan: ${scanId}`);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Scans' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">Network Scans</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage network scanning history
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button 
                onClick={handleStartScan}
                disabled={isScanning}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isScanning 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isScanning ? 'Scanning...' : 'Start New Scan'}
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
                        Scan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nodes Found
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
                        <span className="text-sm font-medium text-gray-900">scan-001</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Full Network
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2 hours ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        12m 34s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        47
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewScan('scan-001')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDownloadScan('scan-001')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">scan-002</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Running
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Quick Scan
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        5 minutes ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        5m 12s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        23
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewScan('scan-002')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleStopScan()}
                          className="text-red-600 hover:text-red-900"
                        >
                          Stop
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">scan-003</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Failed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Deep Scan
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        1 day ago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2m 45s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewScan('scan-003')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleRetryScan('scan-003')}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scan Configuration */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Scan Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Type
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option>Quick Scan</option>
                  <option>Full Network</option>
                  <option>Deep Scan</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Range
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="192.168.1.0/24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add real-time scan progress */}
        {/* TODO: Add scan scheduling */}
        {/* TODO: Add scan templates */}
        {/* TODO: Add scan comparison */}
      </div>
    </div>
  );
};

export default Scans;
