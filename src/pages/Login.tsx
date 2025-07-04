import React from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Login' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-500-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
          
          <Card className="p-6">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-200 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-gray-900 hover:text-gray-900/80">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
