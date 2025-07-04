import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Building2, Server, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/custom/Card';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="mx-auto h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-6xl font-bold text-gray-500-foreground mb-2">404</h1>
            <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
            <p className="text-gray-500-foreground mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <Card className="p-6">
            <div className="space-y-3">
              <Link to="/" className="w-full">
                <Button variant="default" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/organizations" className="w-full">
                <Button variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Organizations
                </Button>
              </Link>
              <Link to="/nodes" className="w-full">
                <Button variant="outline" className="w-full">
                  <Server className="h-4 w-4 mr-2" />
                  View Nodes
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
