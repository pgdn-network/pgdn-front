/**
 * Utility functions for tracking discovery results modal display
 * Uses localStorage to ensure modal is only shown once per node
 */

const DISCOVERY_MODAL_SHOWN_KEY = 'discovery_modal_shown';

export interface DiscoveryModalTracking {
  nodeId: string;
  shownAt: string; // ISO timestamp
}

/**
 * Check if the discovery results modal has been shown for a specific node
 */
export const hasDiscoveryModalBeenShown = (nodeId: string): boolean => {
  try {
    const storedData = localStorage.getItem(DISCOVERY_MODAL_SHOWN_KEY);
    if (!storedData) return false;

    const tracking: DiscoveryModalTracking[] = JSON.parse(storedData);
    return tracking.some(item => item.nodeId === nodeId);
  } catch (error) {
    console.error('Error checking discovery modal tracking:', error);
    return false;
  }
};

/**
 * Mark the discovery results modal as shown for a specific node
 */
export const markDiscoveryModalAsShown = (nodeId: string): void => {
  try {
    const storedData = localStorage.getItem(DISCOVERY_MODAL_SHOWN_KEY);
    let tracking: DiscoveryModalTracking[] = [];

    if (storedData) {
      tracking = JSON.parse(storedData);
    }

    // Check if already marked (shouldn't happen, but be defensive)
    if (tracking.some(item => item.nodeId === nodeId)) {
      return;
    }

    // Add new entry
    tracking.push({
      nodeId,
      shownAt: new Date().toISOString()
    });

    // Clean up old entries (keep only last 100 to prevent localStorage bloat)
    if (tracking.length > 100) {
      tracking = tracking.slice(-100);
    }

    localStorage.setItem(DISCOVERY_MODAL_SHOWN_KEY, JSON.stringify(tracking));
  } catch (error) {
    console.error('Error marking discovery modal as shown:', error);
  }
};

/**
 * Clear all discovery modal tracking (useful for testing or reset)
 */
export const clearDiscoveryModalTracking = (): void => {
  try {
    localStorage.removeItem(DISCOVERY_MODAL_SHOWN_KEY);
  } catch (error) {
    console.error('Error clearing discovery modal tracking:', error);
  }
};

/**
 * Get all tracked discovery modal displays (useful for debugging)
 */
export const getDiscoveryModalTracking = (): DiscoveryModalTracking[] => {
  try {
    const storedData = localStorage.getItem(DISCOVERY_MODAL_SHOWN_KEY);
    if (!storedData) return [];

    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error getting discovery modal tracking:', error);
    return [];
  }
}; 