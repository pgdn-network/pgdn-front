import { useState, useEffect } from 'react';
import { NodeApiService } from '@/api/nodes';
import type { 
  Node, 
  NodeCveResponse, 
  NodeEventsResponse, 
  NodeTasksResponse, 
  NodeScanSessionsResponse,
  NodeReportsResponse,
  NodeStatus,
  NodeSnapshot,
  NodeActionsResponse
} from '@/types/node';
import { useOrganizations } from '@/contexts/OrganizationsContext';

interface UseBasicNodeDataState {
  node: Node | null;
  loading: boolean;
  error: string | null;
}

interface UseNodeDataState {
  node: Node | null;
  cveData: NodeCveResponse | null;
  eventsData: NodeEventsResponse | null;
  // tasksData: NodeTasksResponse | null; // Commented out for now
  scanSessionsData: NodeScanSessionsResponse | null;
  reportsData: NodeReportsResponse | null;
  statusData: NodeStatus | null;
  snapshotData: NodeSnapshot | null;
  actionsData: NodeActionsResponse | null;
  loading: boolean;
  error: string | null;
}

// Hook for fetching only basic node data (used during discovery)
export const useBasicNodeData = (organizationUuid: string, nodeUuid: string) => {
  const [state, setState] = useState<UseBasicNodeDataState>({
    node: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchNodeData = async () => {
      if (!organizationUuid || !nodeUuid) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeUuid);
        
        setState({
          node: nodeData,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch node data',
        }));
      }
    };

    fetchNodeData();
  }, [organizationUuid, nodeUuid]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const fetchNodeData = async () => {
      try {
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeUuid);
        
        setState({
          node: nodeData,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch node data',
        }));
      }
    };

    fetchNodeData();
  };

  return {
    ...state,
    refetch,
  };
};

// Hook for fetching full node data including all additional data (used when node is active and discovered)
export const useNodeData = (organizationUuid: string, nodeUuid: string) => {
  const { organizations } = useOrganizations();
  const organization = organizations.find(org => org.uuid === organizationUuid) || null;
  const [state, setState] = useState<UseNodeDataState>({
    node: null,
    cveData: null,
    eventsData: null,
    // tasksData: null, // Commented out for now
    scanSessionsData: null,
    reportsData: null,
    statusData: null,
    snapshotData: null,
    actionsData: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchNodeData = async () => {
      if (!organizationUuid || !nodeUuid) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeUuid);
        
        // Only fetch additional data if node is active and discovery is completed
        if (nodeData.simple_state === 'active' && nodeData.discovery_status === 'completed') {
          // Fetch all additional data with individual error handling
          let cveData: NodeCveResponse | null = null;
          let eventsData: NodeEventsResponse | null = null;
          // let tasksData: NodeTasksResponse | null = null; // Commented out for now
          let scanSessionsData: NodeScanSessionsResponse | null = null;
          let reportsData: NodeReportsResponse | null = null;
          let statusData: NodeStatus | null = null;
          let snapshotData: NodeSnapshot | null = null;
          let actionsData: NodeActionsResponse | null = null;

          try {
            cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid, 5);
          } catch (cveError) {
            console.warn('Failed to fetch CVE data:', cveError);
            cveData = [];
          }

          try {
            eventsData = await NodeApiService.getNodeEvents(organizationUuid, nodeUuid, 10);
          } catch (eventsError) {
            console.warn('Failed to fetch events data:', eventsError);
            eventsData = null;
          }

          try {
            scanSessionsData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeUuid, 5);
          } catch (scanSessionsError) {
            console.warn('Failed to fetch scan sessions data:', scanSessionsError);
            scanSessionsData = null;
          }

          try {
            reportsData = await NodeApiService.getNodeReports(organizationUuid, nodeUuid, 5);
          } catch (reportsError) {
            console.warn('Failed to fetch reports data:', reportsError);
            reportsData = null;
          }

          try {
            statusData = await NodeApiService.getNodeStatus(organizationUuid, nodeUuid);
          } catch (statusError) {
            console.warn('Failed to fetch status data:', statusError);
            statusData = null;
          }

          try {
            snapshotData = await NodeApiService.getNodeSnapshot(organizationUuid, nodeUuid);
          } catch (snapshotError) {
            console.warn('Failed to fetch snapshot data:', snapshotError);
            snapshotData = null;
          }

          try {
            actionsData = await NodeApiService.getNodeActions(organizationUuid, nodeUuid);
          } catch (actionsError) {
            console.warn('Failed to fetch actions data:', actionsError);
            actionsData = null;
          }

          setState({
            node: nodeData,
            cveData: cveData,
            eventsData: eventsData,
            // tasksData: tasksData, // Commented out for now
            scanSessionsData: scanSessionsData,
            reportsData: reportsData,
            statusData: statusData,
            snapshotData: snapshotData,
            actionsData: actionsData,
            loading: false,
            error: null,
          });
        } else {
          // For nodes not active or discovery not completed, only set basic node data
          setState({
            node: nodeData,
            cveData: null,
            eventsData: null,
            // tasksData: null, // Commented out for now
            scanSessionsData: null,
            reportsData: null,
            statusData: null,
            snapshotData: null,
            actionsData: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch node data',
        }));
      }
    };

    fetchNodeData();
  }, [organizationUuid, nodeUuid]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const fetchNodeData = async () => {
      try {
        const nodeData = await NodeApiService.getNode(organizationUuid, nodeUuid);
        
        // Only fetch additional data if node is active and discovery is completed
        if (nodeData.simple_state === 'active' && nodeData.discovery_status === 'completed') {
          // Fetch all additional data with individual error handling
          let cveData: NodeCveResponse | null = null;
          let eventsData: NodeEventsResponse | null = null;
          // let tasksData: NodeTasksResponse | null = null; // Commented out for now
          let scanSessionsData: NodeScanSessionsResponse | null = null;
          let reportsData: NodeReportsResponse | null = null;
          let statusData: NodeStatus | null = null;
          let snapshotData: NodeSnapshot | null = null;
          let actionsData: NodeActionsResponse | null = null;

          try {
            cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid, 5);
          } catch (cveError) {
            console.warn('Failed to fetch CVE data:', cveError);
            cveData = [];
          }

          try {
            eventsData = await NodeApiService.getNodeEvents(organizationUuid, nodeUuid, 10);
          } catch (eventsError) {
            console.warn('Failed to fetch events data:', eventsError);
            eventsData = null;
          }

          try {
            scanSessionsData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeUuid, 5);
          } catch (scanSessionsError) {
            console.warn('Failed to fetch scan sessions data:', scanSessionsError);
            scanSessionsData = null;
          }

          try {
            reportsData = await NodeApiService.getNodeReports(organizationUuid, nodeUuid, 5);
          } catch (reportsError) {
            console.warn('Failed to fetch reports data:', reportsError);
            reportsData = null;
          }

          try {
            statusData = await NodeApiService.getNodeStatus(organizationUuid, nodeUuid);
          } catch (statusError) {
            console.warn('Failed to fetch status data:', statusError);
            statusData = null;
          }

          try {
            snapshotData = await NodeApiService.getNodeSnapshot(organizationUuid, nodeUuid);
          } catch (snapshotError) {
            console.warn('Failed to fetch snapshot data:', snapshotError);
            snapshotData = null;
          }

          try {
            actionsData = await NodeApiService.getNodeActions(organizationUuid, nodeUuid);
          } catch (actionsError) {
            console.warn('Failed to fetch actions data:', actionsError);
            actionsData = null;
          }

          setState({
            node: nodeData,
            cveData: cveData,
            eventsData: eventsData,
            // tasksData: tasksData, // Commented out for now
            scanSessionsData: scanSessionsData,
            reportsData: reportsData,
            statusData: statusData,
            snapshotData: snapshotData,
            actionsData: actionsData,
            loading: false,
            error: null,
          });
        } else {
          // For nodes not active or discovery not completed, only set basic node data
          setState({
            node: nodeData,
            cveData: null,
            eventsData: null,
            // tasksData: null, // Commented out for now
            scanSessionsData: null,
            reportsData: null,
            statusData: null,
            snapshotData: null,
            actionsData: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch node data',
        }));
      }
    };

    fetchNodeData();
  };

  return {
    ...state,
    organization,
    refetch,
  };
};