import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import { NodeMainLayout } from '@/components/ui/custom/NodeMainLayout';
import { EventCard } from '@/components/ui/custom/EventCard';
import type { NodeEventsResponse } from '@/types/node';

const OrgNodeEvents: React.FC = () => {
  const { slug, nodeId } = useParams<{ slug: string; nodeId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [eventsData, setEventsData] = useState<NodeEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 50;

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  const fetchEvents = async (page: number = 1) => {
    if (!organizationUuid || !nodeId) return;

    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * limit;
      const response = await NodeApiService.getNodeEvents(organizationUuid, nodeId, limit, offset);
      setEventsData(response);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [organizationUuid, nodeId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  if (loading || orgsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Events</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchEvents(currentPage)}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalPages = eventsData ? Math.ceil(eventsData.total / limit) : 0;
  const events = eventsData?.events || [];

  return (
    <NodeMainLayout
      node={{ uuid: nodeId, name: eventsData?.node_name }}
      organization={organization}
      nodeId={nodeId || ''}
      slug={slug || ''}
      onStartScan={() => {}}
      cveData={null}
      eventsData={eventsData}
      scanSessionsData={null}
      reportsData={null}
      snapshotData={null}
      actionsData={null}
      loading={loading}
    >
      <div className="space-y-6">
        {/* Content */}
        <EventCard 
          events={events} 
          organizationSlug={slug}
          nodeId={nodeId}
          showViewMore={false}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} • {eventsData?.total || 0} events total
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </NodeMainLayout>
  );
};

export default OrgNodeEvents; 