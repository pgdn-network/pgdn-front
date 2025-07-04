import React, { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';

const Settings: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    organization: 'TechCorp Inc.',
    timezone: 'UTC',
    language: 'English',
    newsletter: true,
    analytics: false
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', formData);
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      // TODO: Implement account deletion
      alert('Account deletion - TODO: Implement API call');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Settings' }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile', current: activeTab === 'profile' },
    { id: 'account', name: 'Account', current: activeTab === 'account' },
    { id: 'security', name: 'Security', current: activeTab === 'security' },
    { id: 'notifications', name: 'Notifications', current: activeTab === 'notifications' },
    { id: 'preferences', name: 'Preferences', current: activeTab === 'preferences' },
    { id: 'api', name: 'API Keys', current: activeTab === 'api' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account and application preferences
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        tab.current
                          ? 'bg-blue-50 border-blue-500 text-blue-700 border-l-4'
                          : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                      } block w-full text-left pl-3 pr-4 py-2 text-sm font-medium`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Your Organization"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select 
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select 
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                      Subscribe to newsletter and product updates
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="analytics"
                      name="analytics"
                      type="checkbox"
                      checked={formData.analytics}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="analytics" className="ml-2 block text-sm text-gray-900">
                      Help improve our product by sharing usage analytics
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button"
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h2>
                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* TODO: Add password change functionality */}
        {/* TODO: Add two-factor authentication */}
        {/* TODO: Add API key management */}
        {/* TODO: Add notification preferences */}
      </div>
    </div>
  );
};

export default Settings;
