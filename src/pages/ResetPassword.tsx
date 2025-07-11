import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import config from '@/config';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      formData.new_password.trim() !== '' &&
      formData.confirm_password.trim() !== '' &&
      formData.new_password === formData.confirm_password &&
      formData.new_password.length >= 8
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${config.apiUrl}${config.apiPrefix}/reset-password`,
        {
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setIsSuccess(true);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else if (err.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new password reset.');
      } else if (err.response?.status === 422) {
        setError('Password does not meet security requirements.');
      } else {
        setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">        
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Password reset successful
              </h2>
              <p className="mt-2 text-sm text-gray-500-foreground">
                Your password has been successfully updated
              </p>
            </div>
            
            <Card className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  You can now sign in with your new password.
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">
                    Continue to Login
                  </Link>
                </Button>
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
              <Lock className="h-6 w-6 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-500-foreground">
              Enter your new password below
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
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    className="pl-10"
                    placeholder="Enter your new password"
                    value={formData.new_password}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    className="pl-10"
                    placeholder="Confirm your new password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {formData.new_password && formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-xs text-red-600">
                  Passwords do not match
                </p>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-900 hover:text-gray-900/80"
                >
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

export default ResetPassword;