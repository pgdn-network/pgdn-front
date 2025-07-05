import { useState, useEffect } from 'react';
import { NodeApiService } from '@/api/nodes';
import type { 
  Node, 
  NodeCveResponse, 
  NodeEventsResponse, 
  NodeInterventionsResponse, 
  NodeTasksResponse, 
  NodeScanSessionsResponse,
  NodeReportsResponse,
  NodeStatus
} from '@/types/node';

interface UseNodeDataState {
  node: Node | null;
  cveData: NodeCveResponse | null;
  eventsData: NodeEventsResponse | null;
  interventionsData: NodeInterventionsResponse | null;
  tasksData: NodeTasksResponse | null;
  scanSessionsData: NodeScanSessionsResponse | null;
  reportsData: NodeReportsResponse | null;
  statusData: NodeStatus | null;
  loading: boolean;
  error: string | null;
}

export const useNodeData = (organizationUuid: string, nodeUuid: string) => {
  const [state, setState] = useState<UseNodeDataState>({
    node: null,
    cveData: null,
    eventsData: null,
    interventionsData: null,
    tasksData: null,
    scanSessionsData: null,
    reportsData: null,
    statusData: null,
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
        
        // Fetch all additional data with individual error handling
        let cveData: NodeCveResponse | null = null;
        let eventsData: NodeEventsResponse | null = null;
        let interventionsData: NodeInterventionsResponse | null = null;
        let tasksData: NodeTasksResponse | null = null;
        let scanSessionsData: NodeScanSessionsResponse | null = null;
        let reportsData: NodeReportsResponse | null = null;
        let statusData: NodeStatus | null = null;

        try {
          cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid);
        } catch (cveError) {
          console.warn('Failed to fetch CVE data:', cveError);
          cveData = [];
        }

        try {
          eventsData = await NodeApiService.getNodeEvents(organizationUuid, nodeUuid);
        } catch (eventsError) {
          console.warn('Failed to fetch events data:', eventsError);
          eventsData = null;
        }

        try {
          interventionsData = await NodeApiService.getNodeInterventions(organizationUuid, nodeUuid);
        } catch (interventionsError) {
          console.warn('Failed to fetch interventions data:', interventionsError);
          interventionsData = null;
        }

        try {
          tasksData = await NodeApiService.getNodeTasks(organizationUuid, nodeUuid);
        } catch (tasksError) {
          console.warn('Failed to fetch tasks data:', tasksError);
          tasksData = null;
        }

        try {
          scanSessionsData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeUuid);
        } catch (scanSessionsError) {
          console.warn('Failed to fetch scan sessions data:', scanSessionsError);
          scanSessionsData = null;
        }

        try {
          reportsData = await NodeApiService.getNodeReports(organizationUuid, nodeUuid);
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

        setState({
          node: nodeData,
          cveData: cveData,
          eventsData: eventsData,
          interventionsData: interventionsData,
          tasksData: tasksData,
          scanSessionsData: scanSessionsData,
          reportsData: reportsData,
          statusData: statusData,
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
        
        // Fetch all additional data with individual error handling
        let cveData: NodeCveResponse | null = null;
        let eventsData: NodeEventsResponse | null = null;
        let interventionsData: NodeInterventionsResponse | null = null;
        let tasksData: NodeTasksResponse | null = null;
        let scanSessionsData: NodeScanSessionsResponse | null = null;
        let reportsData: NodeReportsResponse | null = null;
        let statusData: NodeStatus | null = null;

        try {
          cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid);
        } catch (cveError) {
          console.warn('Failed to fetch CVE data:', cveError);
          cveData = [];
        }

        try {
          eventsData = await NodeApiService.getNodeEvents(organizationUuid, nodeUuid);
        } catch (eventsError) {
          console.warn('Failed to fetch events data:', eventsError);
          eventsData = null;
        }

        try {
          interventionsData = await NodeApiService.getNodeInterventions(organizationUuid, nodeUuid);
        } catch (interventionsError) {
          console.warn('Failed to fetch interventions data:', interventionsError);
          interventionsData = null;
        }

        try {
          tasksData = await NodeApiService.getNodeTasks(organizationUuid, nodeUuid);
        } catch (tasksError) {
          console.warn('Failed to fetch tasks data:', tasksError);
          tasksData = null;
        }

        try {
          scanSessionsData = await NodeApiService.getNodeScanSessions(organizationUuid, nodeUuid);
        } catch (scanSessionsError) {
          console.warn('Failed to fetch scan sessions data:', scanSessionsError);
          scanSessionsData = null;
        }

        try {
          reportsData = await NodeApiService.getNodeReports(organizationUuid, nodeUuid);
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

        setState({
          node: nodeData,
          cveData: cveData,
          eventsData: eventsData,
          interventionsData: interventionsData,
          tasksData: tasksData,
          scanSessionsData: scanSessionsData,
          reportsData: reportsData,
          statusData: statusData,
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