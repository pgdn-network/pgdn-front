import { useEffect, useRef, useState, useCallback } from 'react';
import { NodeApiService } from '@/api/nodes';

export function useNodeScansPolling(orgUuid: string, nodeId: string) {
  const [scans, setScans] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchScansRef = useRef<(() => Promise<void>) | null>(null);

  // Create a stable fetchScans function
  const fetchScans = useCallback(async () => {
    if (!orgUuid || !nodeId) {
      setScans([]);
      setTotal(0);
      setInitialFetchDone(true);
      return;
    }
    setLoading(true);
    try {
      const res = await NodeApiService.getNodeRunningScanSessions(orgUuid, nodeId);
      const fetchedScans = res.scans || [];
      const fetchedTotal = res.total || 0;
      
      setScans(fetchedScans);
      setTotal(fetchedTotal);
      
      // After initial fetch, decide whether to continue polling
      if (!initialFetchDone) {
        setInitialFetchDone(true);
        
        // If no running scans found, stop any existing polling
        if (fetchedScans.length === 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          // Start polling if we have running scans and not already polling
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              fetchScansRef.current?.();
            }, 15000);
          }
        }
      } else {
        // During polling, if no more running scans, stop polling
        if (fetchedScans.length === 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error fetching running scan sessions:', err);
      setInitialFetchDone(true);
      // Optionally handle error - but don't clear existing scans on error
    } finally {
      setLoading(false);
    }
  }, [orgUuid, nodeId, initialFetchDone]);

  // Update the ref whenever fetchScans changes
  fetchScansRef.current = fetchScans;

  useEffect(() => {
    // Reset state when dependencies change
    setInitialFetchDone(false);
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start initial fetch if we have both orgUuid and nodeId
    if (orgUuid && nodeId) {
      // Initial fetch only - polling decision made inside fetchScans
      fetchScansRef.current?.();
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orgUuid, nodeId]); // Only depend on the actual parameters

  // Manual refresh for WS integration
  const refresh = useCallback(() => {
    fetchScansRef.current?.();
  }, []);

  return { scans, total, loading, refresh };
} 