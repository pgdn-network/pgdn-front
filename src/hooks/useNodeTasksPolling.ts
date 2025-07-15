import { useEffect, useRef, useState, useCallback } from 'react';
import { NodeApiService } from '@/api/nodes';

export function useNodeTasksPolling(orgUuid: string, nodeId: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!orgUuid || !nodeId) return;
    setLoading(true);
    try {
      const res = await NodeApiService.getNodeTasks(orgUuid, nodeId);
      setTasks(res.tasks || []);
      setTotal(res.total || 0);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  }, [orgUuid, nodeId]);

  useEffect(() => {
    fetchTasks();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchTasks, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTasks]);

  // Manual refresh for WS integration
  const refresh = fetchTasks;

  return { tasks, total, loading, refresh };
} 