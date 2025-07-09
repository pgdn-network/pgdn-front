import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';

interface NodeTabNavProps {
  organizationSlug: string;
  nodeId: string;
}

const tabs = [
  { label: 'Summary', value: 'summary', to: (org: string, node: string) => `/organizations/${org}/nodes/${node}` },
  { label: 'Reports', value: 'reports', to: (org: string, node: string) => `/organizations/${org}/nodes/${node}/reports` },
  { label: 'Scans', value: 'scans', to: (org: string, node: string) => `/organizations/${org}/nodes/${node}/scans` },
  { label: 'History', value: 'history', to: (org: string, node: string) => `/organizations/${org}/nodes/${node}/history` },
];

export const NodeTabNav: React.FC<NodeTabNavProps> = ({ organizationSlug, nodeId }) => {
  const location = useLocation();

  // Determine active tab by matching the current path
  const activeTab = tabs.find(tab => location.pathname === tab.to(organizationSlug, nodeId))?.value ||
    (location.pathname.includes('/reports') ? 'reports' :
     location.pathname.includes('/scans') ? 'scans' :
     location.pathname.includes('/history') ? 'history' :
     'summary');

  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm w-full">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full flex border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 h-12">
            {tabs.map(tab => (
              <Link
                key={tab.value}
                to={tab.to(organizationSlug, nodeId)}
                tabIndex={-1}
                className="flex-1 no-underline"
                style={{ textDecoration: 'none' }}
              >
                <TabsTrigger
                  value={tab.value}
                  className={`w-full px-6 py-0 text-base font-medium transition-all duration-200 flex items-center justify-center
                    h-12 rounded-none bg-transparent focus-visible:ring-0 focus-visible:outline-none border-none
                    ${activeTab === tab.value
                      ? 'text-primary font-bold border-b-2 border-primary bg-gray-50 dark:bg-gray-800'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary'}
                  `}
                  style={{ minWidth: 48 }}
                >
                  <span className="flex items-center justify-center relative">
                    {tab.label}
                  </span>
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mb-8" />
    </div>
  );
}; 