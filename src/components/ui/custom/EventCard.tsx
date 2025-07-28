import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Activity, Shield, Search, AlertTriangle, CheckCircle, XCircle, RotateCcw, ExternalLink, FileText, Database } from 'lucide-react'
import type { NodeEvent } from '@/types/node'

interface EventCardProps {
  events: NodeEvent[] | null | undefined
  organizationSlug?: string
  nodeId?: string
  showViewMore?: boolean
  maxEvents?: number
}

interface ParsedEvent {
  id: string
  type: 'action' | 'scan' | 'node' | 'unknown'
  subtype: string
  title: string
  timestamp: Date
  icon: React.ReactNode
  statusColor: string
  details: Array<{ label: string; value: string | number }>
  badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>
}

function parseEvent(event: NodeEvent): ParsedEvent {
  const timestamp = new Date(event.created_at || new Date())
  const eventData = event.event_data || {}

  // Action events
  if (event.event_type?.startsWith('action_')) {
    const actionType = event.event_type.replace('action_', '')
    
    let icon: React.ReactNode
    let statusColor: string
    let title: string

    switch (actionType) {
      case 'created':
        icon = <Activity className="h-4 w-4" />
        statusColor = 'border-blue-500'
        title = `Action Created: ${eventData.title || 'Unknown Action'}`
        break
      case 'closed':
        icon = <CheckCircle className="h-4 w-4" />
        statusColor = 'border-green-500'
        title = `Action Completed: ${eventData.title || 'Unknown Action'}`
        break
      case 'reopened':
        icon = <RotateCcw className="h-4 w-4" />
        statusColor = 'border-yellow-500'
        title = `Action Reopened: ${eventData.title || 'Unknown Action'}`
        break
      default:
        icon = <Activity className="h-4 w-4" />
        statusColor = 'border-gray-500'
        title = `Action ${actionType}: ${eventData.title || 'Unknown Action'}`
    }

    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    if (eventData.action_type) {
      badges.push({ text: eventData.action_type, variant: 'outline' })
    }
    if (eventData.action_identifier) {
      badges.push({ text: eventData.action_identifier, variant: eventData.action_identifier.startsWith('CVE-') ? 'destructive' : 'outline' })
    }
    if (typeof eventData.priority === 'number') {
      badges.push({ 
        text: `Priority ${eventData.priority}`, 
        variant: eventData.priority === 1 ? 'destructive' : eventData.priority === 2 ? 'secondary' : 'outline' 
      })
    }

    return {
      id: event.uuid,
      type: 'action',
      subtype: actionType,
      title,
      timestamp,
      icon,
      statusColor,
      details,
      badges
    }
  }

  // Scan events
  if (event.event_type?.startsWith('scan_')) {
    const scanType = event.event_type.replace('scan_', '')
    
    let icon: React.ReactNode
    let statusColor: string
    let title: string

    switch (scanType) {
      case 'started':
        icon = <Search className="h-4 w-4" />
        statusColor = 'border-blue-500'
        title = `Scan Started: ${eventData.target || 'Unknown Target'}`
        break
      case 'completed':
        icon = <CheckCircle className="h-4 w-4" />
        statusColor = 'border-green-500'
        title = `Scan Completed: ${eventData.target || 'Unknown Target'}`
        break
      case 'failed':
        icon = <XCircle className="h-4 w-4" />
        statusColor = 'border-red-500'
        title = `Scan Failed: ${eventData.target || 'Unknown Target'}`
        break
      default:
        icon = <Search className="h-4 w-4" />
        statusColor = 'border-gray-500'
        title = `Scan ${scanType}: ${eventData.target || 'Unknown Target'}`
    }

    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    if (eventData.scan_type) {
      badges.push({ text: eventData.scan_type.toUpperCase(), variant: 'secondary' })
    }
    if (typeof eventData.scan_level === 'number') {
      badges.push({ text: `Level ${eventData.scan_level}`, variant: 'outline' })
    }
    if (eventData.scan_results_summary?.scan_duration) {
      details.push({ label: 'Duration', value: `${eventData.scan_results_summary.scan_duration}s` })
    }
    if (eventData.scan_results_summary?.open_ports) {
      details.push({ label: 'Open Ports', value: eventData.scan_results_summary.open_ports.length })
    }

    return {
      id: event.uuid,
      type: 'scan',
      subtype: scanType,
      title,
      timestamp,
      icon,
      statusColor,
      details,
      badges
    }
  }

  // Report events
  if (event.event_type === 'report_generated') {
    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    if (eventData.report_type) {
      badges.push({ text: eventData.report_type.replace('_', ' ').toUpperCase(), variant: 'secondary' })
    }
    if (eventData.risk_level) {
      const riskVariant = eventData.risk_level.toLowerCase() === 'critical' ? 'destructive' : 
                          eventData.risk_level.toLowerCase() === 'high' ? 'destructive' : 'outline'
      badges.push({ text: `${eventData.risk_level} Risk`, variant: riskVariant })
    }
    if (typeof eventData.total_vulnerabilities === 'number') {
      details.push({ label: 'Vulnerabilities', value: eventData.total_vulnerabilities })
    }
    if (typeof eventData.critical_vulnerabilities === 'number') {
      details.push({ label: 'Critical', value: eventData.critical_vulnerabilities })
    }
    if (typeof eventData.risk_score === 'number') {
      details.push({ label: 'Risk Score', value: eventData.risk_score })
    }

    return {
      id: event.uuid,
      type: 'scan',
      subtype: 'report',
      title: eventData.title || 'Security Report Generated',
      timestamp,
      icon: <FileText className="h-4 w-4" />,
      statusColor: 'border-blue-500',
      details,
      badges
    }
  }

  // Normalization events
  if (event.event_type === 'normalized') {
    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    badges.push({ text: 'DATA PROCESSING', variant: 'secondary' })
    
    if (typeof eventData.services_count === 'number') {
      details.push({ label: 'Services', value: eventData.services_count })
    }
    if (typeof eventData.open_ports_count === 'number') {
      details.push({ label: 'Open Ports', value: eventData.open_ports_count })
    }
    if (typeof eventData.cve_matches_count === 'number') {
      details.push({ label: 'CVE Matches', value: eventData.cve_matches_count })
    }
    if (eventData.scan_session_id) {
      details.push({ label: 'Session ID', value: eventData.scan_session_id })
    }

    return {
      id: event.uuid,
      type: 'scan',
      subtype: 'normalized',
      title: 'Scan Data Normalized',
      timestamp,
      icon: <Database className="h-4 w-4" />,
      statusColor: 'border-green-500',
      details,
      badges
    }
  }

  // Score update events
  if (event.event_type === 'score_updated') {
    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    badges.push({ text: 'SCORE UPDATE', variant: 'secondary' })
    
    if (eventData.security_grade) {
      const gradeVariant = eventData.security_grade === 'F' ? 'destructive' : 
                          eventData.security_grade === 'D' ? 'destructive' : 
                          eventData.security_grade === 'C' ? 'outline' : 'default'
      badges.push({ text: `Grade ${eventData.security_grade}`, variant: gradeVariant })
    }
    
    if (typeof eventData.score === 'number') {
      details.push({ label: 'Score', value: eventData.score })
    }
    if (typeof eventData.services_count === 'number') {
      details.push({ label: 'Services', value: eventData.services_count })
    }
    if (typeof eventData.open_ports_count === 'number') {
      details.push({ label: 'Open Ports', value: eventData.open_ports_count })
    }
    if (eventData.scan_session_id) {
      details.push({ label: 'Session ID', value: eventData.scan_session_id })
    }

    return {
      id: event.uuid,
      type: 'scan',
      subtype: 'score_updated',
      title: 'Security Score Updated',
      timestamp,
      icon: <Shield className="h-4 w-4" />,
      statusColor: eventData.security_grade === 'F' ? 'border-red-500' : 
                   eventData.security_grade === 'D' ? 'border-orange-500' : 'border-blue-500',
      details,
      badges
    }
  }

  // Node created events
  if (event.event_type === 'node_created') {
    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    badges.push({ text: 'NODE CREATED', variant: 'default' })
    
    if (eventData.creation_method) {
      const methodVariant = eventData.creation_method === 'manual' ? 'default' : 'secondary'
      badges.push({ text: eventData.creation_method.toUpperCase(), variant: methodVariant })
    }
    
    if (eventData.node_name) {
      details.push({ label: 'Node Name', value: eventData.node_name })
    }
    if (eventData.node_address) {
      details.push({ label: 'Address', value: eventData.node_address })
    }
    if (eventData.protocol_name) {
      details.push({ label: 'Protocol', value: eventData.protocol_name })
    }

    return {
      id: event.uuid,
      type: 'node',
      subtype: 'created',
      title: `Node Created: ${eventData.node_name || 'Unknown Node'}`,
      timestamp,
      icon: <Activity className="h-4 w-4" />,
      statusColor: 'border-green-500',
      details,
      badges
    }
  }

  // Node updated events
  if (event.event_type === 'node_updated') {
    const details: Array<{ label: string; value: string | number }> = []
    const badges: Array<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = []

    // Format field name for display
    const fieldDisplayName = eventData.field ? eventData.field.replace('_', ' ').toLowerCase() : 'field'
    const title = `Node Updated: ${fieldDisplayName} changed to ${eventData.value || 'unknown'}`

    // Add main badge for node update
    badges.push({ text: 'NODE UPDATED', variant: 'secondary' })
    
    // Add hook name badge if available
    if (eventData.hook_name) {
      const hookDisplayName = eventData.hook_name.replace(/_/g, ' ').toUpperCase()
      badges.push({ text: hookDisplayName, variant: 'outline' })
    }
    
    // Add field-specific badge
    if (eventData.field) {
      const fieldBadge = eventData.field.toUpperCase()
      let fieldVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline'
      
      // Special handling for important fields
      if (eventData.field === 'node_type') {
        fieldVariant = 'default'
      } else if (eventData.field === 'network') {
        fieldVariant = 'secondary'
      }
      
      badges.push({ text: fieldBadge, variant: fieldVariant })
    }
    
    // Add updated_by badge (skip scan_hook as it's not informative)
    if (eventData.updated_by && eventData.updated_by !== 'scan_hook') {
      badges.push({ text: eventData.updated_by.toUpperCase().replace('_', ' '), variant: 'outline' })
    }
    
    // Add details
    if (eventData.field) {
      details.push({ label: 'Field', value: eventData.field })
    }
    if (eventData.value) {
      details.push({ label: 'New Value', value: eventData.value })
    }
    if (eventData.table) {
      details.push({ label: 'Table', value: eventData.table })
    }
    if (eventData.updated_by && eventData.updated_by !== 'scan_hook') {
      details.push({ label: 'Updated By', value: eventData.updated_by })
    }

    return {
      id: event.uuid,
      type: 'node',
      subtype: 'updated',
      title,
      timestamp,
      icon: <Database className="h-4 w-4" />,
      statusColor: 'border-blue-500',
      details,
      badges
    }
  }

  // Unknown/other events
  return {
    id: event.uuid,
    type: 'unknown',
    subtype: event.event_type || 'unknown',
    title: event.executed_action || 'Unknown Event',
    timestamp,
    icon: <AlertTriangle className="h-4 w-4" />,
    statusColor: 'border-gray-500',
    details: [],
    badges: []
  }
}

function getEventTypeStats(events: ParsedEvent[]) {
  const stats = events.reduce((acc, event) => {
    const key = `${event.type}_${event.subtype}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(stats).map(([key, count]) => {
    const [type, subtype] = key.split('_')
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline'
    let displayText = `${subtype} ${type}`

    if (type === 'action') {
      if (subtype === 'completed' || subtype === 'closed') variant = 'secondary'
      if (subtype === 'created') variant = 'default'
      displayText = subtype === 'closed' ? 'completed' : subtype
    } else if (type === 'scan') {
      if (subtype === 'completed') variant = 'secondary'
      if (subtype === 'started') variant = 'default'
    } else if (type === 'node') {
      if (subtype === 'created') variant = 'secondary'
      if (subtype === 'updated') variant = 'default'
      displayText = `${subtype} node`
    }

    return { text: `${count} ${displayText}`, variant }
  })
}

export function EventCard({ events, organizationSlug, nodeId, showViewMore = true, maxEvents = 10 }: EventCardProps) {
  const safeEvents = Array.isArray(events) ? events : []
  
  if (!safeEvents || safeEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Events
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              No events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No events recorded</p>
        </CardContent>
      </Card>
    )
  }

  // Limit events based on maxEvents prop (default 10 for card views, higher for dedicated pages)
  const limitedEvents = safeEvents.slice(0, maxEvents)
  const parsedEvents = limitedEvents.map(parseEvent).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  const eventStats = getEventTypeStats(parsedEvents)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
            <span className="text-sm font-normal text-muted-foreground">
              {parsedEvents.length} events{safeEvents.length > maxEvents ? ` (${safeEvents.length} total)` : ''}
            </span>
          </h2>
          {showViewMore && safeEvents.length > maxEvents && organizationSlug && nodeId && (
            <a
              href={`/organizations/${organizationSlug}/nodes/${nodeId}/history`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View All Events
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {eventStats.map((stat, index) => (
            <Badge 
              key={index} 
              variant={stat.variant} 
              className={`text-xs ${
                stat.variant === 'secondary' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                  : stat.variant === 'default'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              {stat.text}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="space-y-4">
          {parsedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < parsedEvents.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${event.statusColor} bg-white dark:bg-gray-900 flex items-center justify-center relative z-10`}>
                  {event.icon}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.timestamp.toLocaleDateString()} at {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  {event.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.badges.map((badge, badgeIndex) => (
                        <Badge 
                          key={badgeIndex} 
                          variant={badge.variant} 
                          className={`text-xs font-medium ${
                            badge.text.includes('CVE-') 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              : badge.text === 'NODE CREATED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : badge.text === 'MANUAL'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : badge.text === 'AUTOMATIC'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                              : badge.variant === 'secondary' && (badge.text === 'WEB' || badge.text === 'NETWORK' || badge.text === 'HOST')
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : badge.variant === 'destructive'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              : badge.variant === 'default'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : badge.variant === 'secondary'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                          }`}
                        >
                          {badge.text}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Details */}
                  {event.details.length > 0 && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {event.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex gap-2">
                          <span>{detail.label}:</span>
                          <span className="font-mono">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more events link at bottom if there are more */}
        {showViewMore && safeEvents.length > maxEvents && organizationSlug && nodeId && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <a
              href={`/organizations/${organizationSlug}/nodes/${nodeId}/history`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View All {safeEvents.length} Events
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}