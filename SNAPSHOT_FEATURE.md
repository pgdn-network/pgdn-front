# Node Snapshot Feature

## Overview

A new Node Snapshot card has been added to the organization node details page that displays comprehensive real-time information about a node's current state, security status, and operational metrics.

## Features

### Data Displayed

The Node Snapshot card shows the following information:

#### Operational Status
- **Operational Status**: Current health status (healthy, warning, critical)
- **Status Message**: Human-readable status description
- **Last Scan Date**: When the most recent scan was performed
- **Scan Status**: Current scan state (completed, running, failed)
- **Scan Completeness**: Percentage of scan completion (if available)
- **Latest Score**: Security score (if available)

#### Security Metrics
- **Total CVEs**: Number of Common Vulnerabilities and Exposures
- **Critical CVEs**: Number of critical severity vulnerabilities
- **High CVEs**: Number of high severity vulnerabilities
- **Open Ports**: Total number of open ports detected
- **Web Server**: Whether a web server was detected
- **SSL Issues**: Whether SSL/TLS issues were found

#### Network Information
- **Open Ports List**: Detailed list of all open ports with visual badges
- **Geographic Location**: City and country information (if available)

#### Task and Intervention Summary
- **Active Tasks**: Number of currently running tasks
- **Failed Tasks**: Number of failed tasks
- **Open Interventions**: Number of open interventions
- **Critical Interventions**: Number of critical interventions

#### Activity Tracking
- **Last Activity**: Timestamp of the most recent activity
- **Last Updated**: When the snapshot data was last refreshed

## Technical Implementation

### API Endpoint

The feature uses the following API endpoint:
```
GET /organizations/{org_uuid}/nodes/{node_id}/snapshot
```

### Components

1. **NodeSnapshotCard** (`src/components/ui/custom/NodeSnapshotCard.tsx`)
   - Main component that renders the snapshot data
   - Handles loading states and error conditions
   - Responsive design with grid layout
   - Color-coded status indicators

2. **API Integration** (`src/api/nodes.ts`)
   - `getNodeSnapshot()` method added to NodeApiService
   - Proper error handling and type safety

3. **Data Hook** (`src/hooks/useNodeData.ts`)
   - Integrated snapshot data fetching into existing useNodeData hook
   - Maintains consistency with other node data fetching patterns

4. **Types** (`src/types/node.ts`)
   - `NodeSnapshot` interface defines the data structure
   - Comprehensive type definitions for all snapshot fields

### Integration

The Node Snapshot card is integrated into the organization node details page (`src/pages/OrgNodeDetail.tsx`) and appears between the Node Status section and the CVE Details section.

## Usage

1. Navigate to an organization node details page
2. The Node Snapshot card will automatically load and display current data
3. Data refreshes when the page is loaded or when the refetch function is called
4. The card shows loading states while data is being fetched

## Error Handling

- Graceful handling of missing optional data
- Loading states for better user experience
- Error logging for debugging purposes
- Fallback displays when data is unavailable

## Styling

The component uses:
- Tailwind CSS for styling
- Lucide React icons for visual elements
- Responsive grid layout
- Color-coded status badges
- Dark mode support

## Future Enhancements

Potential improvements could include:
- Real-time updates via WebSocket
- Historical snapshot data comparison
- Export functionality for snapshot data
- Customizable display options
- Integration with alerting systems 