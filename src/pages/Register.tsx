import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import type { ApiErrorResponse, ApiErrorDetail, ValidationError } from '@/api/auth';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  organization_name: z.string().min(1, 'Organization name is required'),
  agree_terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [error, setError] = useState('');
  const { register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const breadcrumbItems = [
    { label: 'PGDN' }
  ];

  const parseApiError = (errorResponse: ApiErrorResponse): string => {
    const { detail } = errorResponse;
    
    if (Array.isArray(detail)) {
      // Handle validation errors
      const validationErrors = detail as ValidationError[];
      const messages = validationErrors.map(error => {
        const field = error.loc[error.loc.length - 1];
        return `${field}: ${error.msg}`;
      });
      return messages.join(', ');
    } else {
      // Handle API error detail
      const apiError = detail as ApiErrorDetail;
      return `${apiError.message}. ${apiError.recommendation}`;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        first_name: data.first_name,
        last_name: data.last_name,
        organization_name: data.organization_name,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: ApiErrorResponse } };
      if (error.response?.data) {
        setError(parseApiError(error.response.data));
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-gray-900" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-500-foreground">
              Join us and start managing your network
            </p>
          </div>
          
          <Card className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                    <Input
                      id="first_name"
                      type="text"
                      className="pl-10"
                      placeholder="First name"
                      {...register('first_name')}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                    <Input
                      id="last_name"
                      type="text"
                      className="pl-10"
                      placeholder="Last name"
                      {...register('last_name')}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="organization_name"
                    type="text"
                    className="pl-10"
                    placeholder="Enter your organization name"
                    {...register('organization_name')}
                  />
                </div>
                {errors.organization_name && (
                  <p className="text-sm text-red-600">{errors.organization_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    placeholder="Choose a password"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="confirm_password"
                    type="password"
                    className="pl-10"
                    placeholder="Confirm your password"
                    {...register('confirm_password')}
                  />
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-200 rounded"
                    {...register('agree_terms')}
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-gray-900 hover:text-gray-900/80">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-gray-900 hover:text-gray-900/80">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {errors.agree_terms && (
                  <p className="text-sm text-red-600">{errors.agree_terms.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !isValid}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-gray-900 hover:text-gray-900/80">
                  Sign in
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
