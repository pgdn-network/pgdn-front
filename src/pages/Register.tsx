import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '../components/common/Breadcrumb';
import { Card } from '@/components/ui/custom/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    organization_name: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const breadcrumbItems = [
    { label: 'PGDN' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeTerms(e.target.checked);
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      'email',
      'username', 
      'password',
      'confirm_password',
      'first_name',
      'last_name',
      'organization_name'
    ];
    
    const allFieldsFilled = requiredFields.every(field => 
      formData[field as keyof typeof formData].trim() !== ''
    );
    
    return allFieldsFilled && agreeTerms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register(formData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                      name="first_name"
                      type="text"
                      required
                      className="pl-10"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="pl-10"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
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
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="pl-10"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="organization_name"
                    name="organization_name"
                    type="text"
                    required
                    className="pl-10"
                    placeholder="Enter your organization name"
                    value={formData.organization_name}
                    onChange={handleChange}
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
                    placeholder="Choose a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500-foreground" />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    className="pl-10"
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={handleTermsChange}
                  className="h-4 w-4 text-gray-900 focus:ring-primary border-gray-200 rounded"
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
              
              <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
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
