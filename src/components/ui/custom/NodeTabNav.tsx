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
  { label: <SettingsIcon className="w-5 h-5" aria-label="Settings" />, value: 'settings', to: (org: string, node: string) => `/organizations/${org}/nodes/${node}/settings`, isIcon: true },
];

export const NodeTabNav: React.FC<NodeTabNavProps> = ({ organizationSlug, nodeId }) => {
  const location = useLocation();

  // Determine active tab by matching the current path
  const activeTab = tabs.find(tab => location.pathname === tab.to(organizationSlug, nodeId))?.value ||
    (location.pathname.includes('/reports') ? 'reports' :
     location.pathname.includes('/scans') ? 'scans' :
     location.pathname.includes('/history') ? 'history' :
     location.pathname.includes('/settings') ? 'settings' :
     'summary');

  return (
    <div className="w-full mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full flex border-b border-gray-200 dark:border-gray-700 bg-transparent p-0">
            {tabs.map(tab => (
              <Link
                key={tab.value}
                to={tab.to(organizationSlug, nodeId)}
                tabIndex={-1}
                className="flex-1"
              >
                <TabsTrigger
                  value={tab.value}
                  aria-label={tab.isIcon ? 'Settings' : undefined}
                  className={`w-full px-6 py-2 text-base font-medium transition-all duration-200 flex items-center justify-center
                    border-b-2
                    ${activeTab === tab.value
                      ? 'border-primary text-primary dark:text-white'
                      : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary'}
                    bg-transparent focus-visible:ring-0 focus-visible:outline-none`}
                  style={{ minWidth: 48 }}
                >
                  {tab.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}; 