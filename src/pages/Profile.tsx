import React from 'react';
import { User, Mail, Building, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4">      
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{user.username}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{user.email || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : 'Not provided'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Organization ID
              </label>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 font-mono text-sm">{user.org_uuid}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;