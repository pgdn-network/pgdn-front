import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Globe, Menu } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/public" className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PGDN Network
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/public" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Public Nodes
              </Link>
              <a 
                href="#about" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </a>
              <a 
                href="#contact" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <Button asChild>
                  <Link to="/">Dashboard</Link>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="outline">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  PGDN Network
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and explore public blockchain nodes across different protocols.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#documentation" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#api" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#support" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400">
              © 2024 PGDN Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 