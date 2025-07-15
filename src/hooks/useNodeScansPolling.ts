import { useEffect, useRef, useState, useCallback } from 'react';
import { NodeApiService } from '@/api/nodes';

export function useNodeScansPolling(orgUuid: string, nodeId: string) {
  const [scans, setScans] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchScansRef = useRef<(() => Promise<void>) | null>(null);

  // Create a stable fetchScans function
  const fetchScans = useCallback(async () => {
    if (!orgUuid || !nodeId) {
      setScans([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await NodeApiService.getNodeRunningScanSessions(orgUuid, nodeId);
      setScans(res.scans || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching running scan sessions:', err);
      // Optionally handle error - but don't clear existing scans on error
    } finally {
      setLoading(false);
    }
  }, [orgUuid, nodeId]);

  // Update the ref whenever fetchScans changes
  fetchScansRef.current = fetchScans;

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start polling if we have both orgUuid and nodeId
    if (orgUuid && nodeId) {
      // Initial fetch
      fetchScansRef.current?.();
      
      // Set up polling interval
      intervalRef.current = setInterval(() => {
        fetchScansRef.current?.();
      }, 15000);
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