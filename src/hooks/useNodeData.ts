import { useState, useEffect } from 'react';
import { NodeApiService } from '@/api/nodes';
import type { Node, NodeCveResponse } from '@/types/node';

interface UseNodeDataState {
  node: Node | null;
  cveData: NodeCveResponse | null;
  loading: boolean;
  error: string | null;
}

export const useNodeData = (organizationUuid: string, nodeUuid: string) => {
  const [state, setState] = useState<UseNodeDataState>({
    node: null,
    cveData: null,
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
        
        let cveData: NodeCveResponse | null = null;
        try {
          cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid);
        } catch (cveError) {
          console.warn('Failed to fetch CVE data:', cveError);
          cveData = [];
        }

        setState({
          node: nodeData,
          cveData: cveData,
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
        
        let cveData: NodeCveResponse | null = null;
        try {
          cveData = await NodeApiService.getNodeCveMatches(organizationUuid, nodeUuid);
        } catch (cveError) {
          console.warn('Failed to fetch CVE data:', cveError);
          cveData = [];
        }

        setState({
          node: nodeData,
          cveData: cveData,
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