import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NodeApiService } from '@/api/nodes';
import type { PublicNode } from '@/types/node';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, User, Calendar, Network, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicNodes() {
  const { user, isAuthenticated } = useAuth();
  const [nodes, setNodes] = useState<PublicNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicNodes();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      fetchPublicNodes(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchPublicNodes = async (search?: string) => {
    try {
      if (!search) {
        setIsLoading(true);
      }
      setError(null);
      const nodesData = await NodeApiService.getPublicNodes(search);
      setNodes(nodesData);
    } catch (err) {
      console.error('Error fetching public nodes:', err);
      setError('Failed to load public nodes. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (claimStatus: string) => {
    switch (claimStatus) {
      case 'claimed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unclaimed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Globe className="w-8 h-8 mr-3 text-blue-600" />
          Public Nodes
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and explore public blockchain nodes across different protocols
        </p>
        {isAuthenticated && user && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Welcome back, {user.first_name || user.username}!
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search nodes by name, address, or protocol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Network className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nodes.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nodes.filter(n => n.is_public).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Public Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nodes.filter(n => n.claim_status === 'unclaimed').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nodes List */}
      <div className="space-y-4">
        {isSearching && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Searching...</span>
            </div>
          </div>
        )}
        
        {!isSearching && nodes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No nodes found matching your search.' : 'No public nodes available.'}
              </p>
            </CardContent>
          </Card>
        ) : !isSearching && (
          nodes.map((node: PublicNode) => (
            <Card key={node.uuid} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {node.name}
                      </h3>
                      <Badge 
                        className={getStatusColor(node.claim_status)}
                      >
                        {node.claim_status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {node.address}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(node.created_at)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {node.current_owner_type}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                                         <div className="flex flex-wrap gap-1">
                       {node.protocols.map((protocol: string) => (
                         <Badge key={protocol} variant="secondary">
                           {protocol}
                         </Badge>
                       ))}
                     </div>
                    {isAuthenticated && (
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 