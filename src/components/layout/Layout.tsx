import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalNotifications } from '@/components/ui/custom/GlobalNotifications';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if current page needs full-width layout (for banners)
  const needsFullWidth = location.pathname.includes('/nodes/') || location.pathname.includes('/organizations/');

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global Notifications */}
      <GlobalNotifications />
      {/* Desktop Sidebar - Fixed positioning with exact 240px width */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-60 z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
            onClick={toggleMobileMenu} 
          />
          <div className="relative flex w-full max-w-xs transform transition-transform duration-300 ease-out">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content Area - Fluid with proper spacing */}
      <div className="md:ml-60 flex flex-col min-h-screen relative">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        <main className={`flex-1 bg-background relative ${!needsFullWidth ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          {/* Content wrapper */}
          <div className={`animation-fade-in ${!needsFullWidth ? 'max-w-7xl mx-auto space-y-12' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
