import { NodeApiService } from '@/api/nodes';
import type { ScanSessionResponse, ScanSessionStatus, ScanInfo } from '@/types/node';

export interface TrackedScan {
  sessionId: string;
  trackingUrl: string;
  scans: ScanInfo[];
  onUpdate: (status: ScanSessionStatus) => void;
  onComplete: (status: ScanSessionStatus) => void;
  intervalId?: NodeJS.Timeout;
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

    // Stop existing tracking for this session if any
    this.stopTracking(session_id);

    const trackedScan: TrackedScan = {
      sessionId: session_id,
      trackingUrl: tracking_urls.session,
      scans: sessionResponse.scans,
      onUpdate,
      onComplete,
    };

    // Start polling
    const intervalId = setInterval(async () => {
      try {
        const status = await NodeApiService.getScanSession(tracking_urls.session);
        
        // Update the tracked scan
        trackedScan.scans = status.scans;
        
        // Call update callback
        onUpdate(status);
        
        // Check if all scans are complete
        const allComplete = status.scans.every(scan => 
          scan.status === 'completed' || scan.status === 'failed'
        );
        
        if (allComplete || status.status === 'completed' || status.status === 'failed') {
          this.stopTracking(session_id);
          onComplete(status);
        }
      } catch (error) {
        console.error(`Error tracking scan session ${session_id}:`, error);
        // Continue polling on error, but could implement exponential backoff
      }
    }, this.pollingInterval);

    trackedScan.intervalId = intervalId;
    this.trackedScans.set(session_id, trackedScan);
  }

  stopTracking(sessionId: string) {
    const trackedScan = this.trackedScans.get(sessionId);
    if (trackedScan?.intervalId) {
      clearInterval(trackedScan.intervalId);
      this.trackedScans.delete(sessionId);
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