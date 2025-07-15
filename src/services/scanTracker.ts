// import { NodeApiService } from '@/api/nodes';
import type { ScanSessionResponse, ScanSessionStatus, ScanInfo } from '@/types/node';
// import type { NodeScanSession } from '@/types/node';

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
  private trackedScans: Map<string, TrackedScan> = new Map<string, TrackedScan>();
  // private pollingInterval = 2000; // 2 seconds - TEMPORARILY DISABLED

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

    // TEMPORARILY DISABLED: Polling logic commented out
    console.log(`Polling disabled for session ${session_id} - tracking setup but no active polling`);
    
    this.trackedScans.set(session_id, trackedScan);
    
    // Start tracking individual tasks if available
    // this.startTaskTracking(sessionId, sessionResponse);
  }

  /*
  private startTaskTracking(sessionId: string, sessionResponse: ScanSessionResponse) {
    const { tracking_urls } = sessionResponse;
    // Check if we have individual task tracking URLs
    if (!tracking_urls.scan_tasks || tracking_urls.scan_tasks.length === 0) {
      console.log(`No individual task tracking URLs available for session ${sessionId}`);
      return;
    }
    console.log(`Starting task tracking for session ${sessionId} with ${tracking_urls.scan_tasks.length} tasks`);
    const trackedScan: TrackedScan | undefined = this.trackedScans.get(sessionId);
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
  */

  /*
  private stopTaskTracking(sessionId: string, taskId: string) {
    const trackedScan: TrackedScan | undefined = this.trackedScans.get(sessionId);
    if (trackedScan?.taskIntervals?.has(taskId)) {
      const interval = trackedScan.taskIntervals.get(taskId);
      if (interval) {
        clearInterval(interval);
        trackedScan.taskIntervals.delete(taskId);
        console.log(`Stopped tracking task ${taskId} for session ${sessionId}`);
      }
    }
  }
  */

  stopTracking(sessionId: string): boolean {
    const trackedScan: TrackedScan | undefined = this.trackedScans.get(sessionId);
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
      if (trackedScan.taskIntervals) {
        trackedScan.taskIntervals.forEach((interval) => {
          clearInterval(interval);
        });
        trackedScan.taskIntervals.clear();
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