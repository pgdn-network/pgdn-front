import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import config from '@/config';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await axios.post(
        `${config.apiUrl}${config.apiPrefix}/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setIsSuccess(true);
      setMessage('Password reset instructions have been sent to your email address.');
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else if (err.response?.status === 404) {
        setError('No account found with this email address.');
      } else {
        setError(err.response?.data?.detail || 'Failed to send reset instructions. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">        
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-500-foreground">
                We've sent password reset instructions to {email}
              </p>
            </div>
            
            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {message}
                </p>
                <div className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login" className="flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Forgot your password?
            </h2>
            <p className="mt-2 text-sm text-gray-500-foreground">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>
          
          <Card className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-900 hover:text-gray-900/80 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;