import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background relative">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background relative mt-8">
          {/* Content container */}
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Content wrapper */}
            <div className="animation-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
