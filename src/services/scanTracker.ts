import { NodeApiService } from '@/api/nodes';
import type { ScanSessionResponse, ScanSessionStatus, ScanInfo, NodeScanSession } from '@/types/node';

export interface TrackedScan {
  sessionId: string;
  trackingUrl: string;
  scans: ScanInfo[];
  onUpdate: (status: ScanSessionStatus) => void;
  onComplete: (status: ScanSessionStatus) => void;
  intervalId?: NodeJS.Timeout;
  taskIntervals?: Map<string, NodeJS.Timeout>; // Track individual task polling intervals
}

class ScanTracker {
  private trackedScans: Map<string, TrackedScan> = new Map();
  private pollingInterval = 2000; // 2 seconds

  startTracking(
    sessionResponse: ScanSessionResponse,
    onUpdate: (status: ScanSessionStatus) => void,
    onComplete: (status: ScanSessionStatus) => void
  ) {
    const { session_id, tracking_urls } = sessionResponse;
    
    if (!tracking_urls.session) {
      console.warn('No session tracking URL provided');
      return;
    }

    console.log(`Starting tracking for session ${session_id}`);
    
    // Stop existing tracking for this session if any
    this.stopTracking(session_id);

    const trackedScan: TrackedScan = {
      sessionId: session_id,
      trackingUrl: tracking_urls.session,
      scans: sessionResponse.scans,
      onUpdate,
      onComplete,
      taskIntervals: new Map(),
    };

    // Start polling
    const intervalId = setInterval(async () => {
      console.log(`Polling session ${session_id}...`);
      try {
        const response = await NodeApiService.getScanSession(tracking_urls.session);
        
        // Validate the response structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response structure from scan session API');
        }
        
        // Handle the actual API response structure (NodeScanSession)
        if ('scan_id' in response && 'status' in response && 'node_uuid' in response) {
          // This is a NodeScanSession response
          const sessionStatus = response as unknown as NodeScanSession;
          
          // Convert to ScanSessionStatus format for compatibility
          const status: ScanSessionStatus = {
            session_id: sessionStatus.scan_id,
            node_uuid: sessionStatus.node_uuid,
            organization_uuid: sessionStatus.organization_uuid,
            status: sessionStatus.status === 'complete' ? 'completed' : 
                   sessionStatus.status === 'failed' ? 'failed' : 'running',
            total_scans: 1, // Default to 1 since we don't have individual scan info
            completed_scans: sessionStatus.status === 'complete' ? 1 : 0,
            failed_scans: sessionStatus.status === 'failed' ? 1 : 0,
            scans: [], // No individual scan info in this response
            created_at: sessionStatus.created_at,
            completed_at: sessionStatus.completed_at || undefined
          };
          
          // Call update callback
          onUpdate(status);
          
          // Stop polling if session is complete or failed
          if (sessionStatus.status === 'complete' || sessionStatus.status === 'failed') {
            console.log(`Scan session ${session_id} is ${sessionStatus.status}, stopping polling`);
            console.log(`Response scan_id: ${sessionStatus.scan_id}, tracking session_id: ${session_id}`);
            
            // Try to stop tracking with scan_id first, then fallback to session_id
            const trackingId = sessionStatus.scan_id;
            const wasStopped = this.stopTracking(trackingId);
            
            // If scan_id didn't work, try with the original session_id
            if (!wasStopped && trackingId !== session_id) {
              console.log(`Failed to stop with scan_id ${trackingId}, trying session_id ${session_id}`);
              this.stopTracking(session_id);
            }
            
            onComplete(status);
          }
        } else if ('scans' in response && Array.isArray(response.scans)) {
          // This is the expected ScanSessionStatus response
          const status = response as ScanSessionStatus;
          
          // Update the tracked scan
          trackedScan.scans = status.scans;
          
          // Call update callback
          onUpdate(status);
          
          // Check if all scans are complete
          const allComplete = status.scans.every(scan => 
            scan && scan.status && (scan.status === 'completed' || scan.status === 'failed')
          );
          
          if (allComplete || status.status === 'completed' || status.status === 'failed') {
            this.stopTracking(session_id);
            onComplete(status);
          }
        } else {
          console.warn(`Unexpected response structure for session ${session_id}:`, response);
          throw new Error('Unexpected response structure from scan session API');
        }
      } catch (error: any) {
        console.error(`Error tracking scan session ${session_id}:`, error);
        
        // Stop polling on HTTP errors (404, 500, etc.)
        if (error.response?.status) {
          console.warn(`Stopping tracking for session ${session_id} due to HTTP error: ${error.response.status}`);
          this.stopTracking(session_id);
          
          // Call onComplete with error status to update UI
          const errorStatus: ScanSessionStatus = {
            session_id,
            node_uuid: sessionResponse.node_uuid,
            organization_uuid: sessionResponse.organization_uuid,
            status: 'failed',
            total_scans: sessionResponse.total_scans,
            completed_scans: 0,
            failed_scans: sessionResponse.total_scans,
            scans: sessionResponse.scans.map(scan => ({
              ...scan,
              status: 'failed' as const,
              progress: 0
            })),
            created_at: sessionResponse.created_at
          };
          onComplete(errorStatus);
        }
        // For network errors or other issues, continue polling (could implement exponential backoff later)
      }
    }, this.pollingInterval);

    trackedScan.intervalId = intervalId;
    this.trackedScans.set(session_id, trackedScan);
    
    // Start tracking individual tasks if available
    this.startTaskTracking(session_id, sessionResponse);
  }

  private startTaskTracking(sessionId: string, sessionResponse: ScanSessionResponse) {
    const { tracking_urls, scans } = sessionResponse;
    
    // Check if we have individual task tracking URLs
    if (!tracking_urls.scan_tasks || tracking_urls.scan_tasks.length === 0) {
      console.log(`No individual task tracking URLs available for session ${sessionId}`);
      return;
    }
    
    console.log(`Starting task tracking for session ${sessionId} with ${tracking_urls.scan_tasks.length} tasks`);
    
    const trackedScan = this.trackedScans.get(sessionId);
    if (!trackedScan) {
      console.warn(`No tracked scan found for session ${sessionId} when starting task tracking`);
      return;
    }
    
    // Start polling each task
    tracking_urls.scan_tasks!.forEach((taskUrl: string, index: number) => {
      const taskId = taskUrl.split('/').pop() || `task-${index}`;
      console.log(`Starting tracking for task ${taskId} with URL: ${taskUrl}`);
      
      const taskInterval = setInterval(async () => {
        try {
          const response = await NodeApiService.getTaskStatus(taskUrl);
          console.log(`Task ${taskId} status:`, response);
        } catch (error: any) {
          console.error(`Error tracking task ${taskId}:`, error);
          
          // Stop polling this task on HTTP errors
          if (error.response?.status) {
            console.warn(`Stopping task tracking for ${taskId} due to HTTP error: ${error.response.status}`);
            this.stopTaskTracking(sessionId, taskId);
          }
        }
      }, this.pollingInterval);
      
      trackedScan.taskIntervals?.set(taskId, taskInterval);
    });
  }
  
  private stopTaskTracking(sessionId: string, taskId: string) {
    const trackedScan = this.trackedScans.get(sessionId);
    if (trackedScan?.taskIntervals?.has(taskId)) {
      const interval = trackedScan.taskIntervals.get(taskId);
      if (interval) {
        clearInterval(interval);
        trackedScan.taskIntervals.delete(taskId);
        console.log(`Stopped tracking task ${taskId} for session ${sessionId}`);
      }
    }
  }

  stopTracking(sessionId: string): boolean {
    const trackedScan = this.trackedScans.get(sessionId);
    if (trackedScan?.intervalId) {
      console.log(`Stopping tracking for session ${sessionId}, clearing interval`);
      clearInterval(trackedScan.intervalId);
      
      // Stop all task tracking for this session
      if (trackedScan.taskIntervals) {
        trackedScan.taskIntervals.forEach((interval, taskId) => {
          clearInterval(interval);
          console.log(`Stopped task tracking for ${taskId}`);
        });
        trackedScan.taskIntervals.clear();
      }
      
      this.trackedScans.delete(sessionId);
      console.log(`Tracking stopped for session ${sessionId}, remaining tracked sessions: ${this.trackedScans.size}`);
      return true;
    } else {
      console.log(`No tracking found for session ${sessionId}`);
      return false;
    }
  }

  stopAllTracking() {
    this.trackedScans.forEach((trackedScan) => {
      if (trackedScan.intervalId) {
        clearInterval(trackedScan.intervalId);
      }
    });
    this.trackedScans.clear();
  }

  getTrackedScans(): TrackedScan[] {
    return Array.from(this.trackedScans.values());
  }

  isTracking(sessionId: string): boolean {
    return this.trackedScans.has(sessionId);
  }
}

// Singleton instance
export const scanTracker = new ScanTracker();