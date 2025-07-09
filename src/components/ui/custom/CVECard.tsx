import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import type { CveMatch } from '@/types/node'

interface CVECardProps {
  cves: CveMatch[] | null | undefined
  organizationSlug?: string
  nodeId?: string
}

function getSeverityVariant(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'destructive'
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'outline'
    default:
      return 'outline'
  }
}

export function CVECard({ cves, organizationSlug, nodeId }: CVECardProps) {
  // Ensure cves is an array and handle null/undefined cases
  const safeCves = Array.isArray(cves) ? cves : []
  
  // Filter for only unfixed CVEs
  const openCVEs = safeCves.filter(cve => !cve.fixed)
  
  if (!openCVEs || openCVEs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-lg font-medium text-gray-900 dark:text-white">Vulnerabilities</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
            All good
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">No open CVEs detected</p>
      </div>
    )
  }

  const severityCounts = openCVEs.reduce((acc, cve) => {
    acc[cve.severity.toLowerCase()] = (acc[cve.severity.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-lg font-medium text-gray-900 dark:text-white">Vulnerabilities</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-normal text-muted-foreground">
            {openCVEs.length} open
          </span>
          {organizationSlug && nodeId && (
            <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/cves`}>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(severityCounts).map(([severity, count]) => (
          <Badge key={severity} variant={getSeverityVariant(severity)}>
            {count} {severity.toUpperCase()}
          </Badge>
        ))}
      </div>
      <div className="space-y-3">
        {openCVEs.slice(0, 5).map((cve, index) => (
          <div key={`${cve.match_uuid}-${index}`} className="border-l-2 border-muted pl-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{cve.cve_id}</span>
              <Badge variant={getSeverityVariant(cve.severity)} className="text-xs">
                {cve.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                CVSS: {cve.cvss_score}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(cve.matched_at).toLocaleDateString()}
              </span>
              {organizationSlug && nodeId && (
                <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/cves/${cve.match_uuid}`}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <span>Confidence: {(cve.confidence_score * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
      {openCVEs.length > 5 && organizationSlug && nodeId && (
        <div className="text-center pt-2">
          <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/cves`}>
            <Button variant="outline" size="sm">
              View {openCVEs.length - 5} more CVEs
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}