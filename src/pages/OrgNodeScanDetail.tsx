import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrganizations } from '@/contexts/OrganizationsContext';
import { NodeApiService } from '@/api/nodes';
import ScanResultsPage from '@/components/ui/custom/ScanResultsPage';

const OrgNodeScanDetail: React.FC = () => {
  const { slug, nodeId, scanId } = useParams<{ slug: string; nodeId: string; scanId: string }>();
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find organization by slug
  const organization = organizations.find(org => org.slug === slug);
  const organizationUuid = organization?.uuid || '';

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!organizationUuid || !nodeId || !scanId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await NodeApiService.getNodeSessionDetail(organizationUuid, nodeId, scanId);
        setSessionDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetail();
  }, [organizationUuid, nodeId, scanId]);

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
        <div className="p-6 border text-center">Error Loading Scan: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scan Details</h1>
        <Link to={`/organizations/${slug}/nodes/${nodeId}/scans`} className="text-primary underline text-sm font-medium">&larr; Back to Scans</Link>
      </div>
      {!sessionDetail ? (
        <div className="p-6 border text-center text-muted-foreground">Session not found</div>
      ) : (
        <ScanResultsPage scanData={sessionDetail} />
      )}
    </div>
  );
};

export default OrgNodeScanDetail; 