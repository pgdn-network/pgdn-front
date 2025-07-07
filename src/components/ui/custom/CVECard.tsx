import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CveMatch } from '@/types/node'

interface CVECardProps {
  cves: CveMatch[] | null | undefined
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

export function CVECard({ cves }: CVECardProps) {
  // Ensure cves is an array and handle null/undefined cases
  const safeCves = Array.isArray(cves) ? cves : []
  
  if (!safeCves || safeCves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Vulnerabilities
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              All good
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No open CVEs detected</p>
        </CardContent>
      </Card>
    )
  }

  // Show all CVE matches, not just unique ones
  const allCVEs = safeCves

  const severityCounts = safeCves.reduce((acc, cve) => {
    acc[cve.severity.toLowerCase()] = (acc[cve.severity.toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Vulnerabilities
          <span className="text-sm font-normal text-muted-foreground">
            {safeCves.length} matches
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(severityCounts).map(([severity, count]) => (
            <Badge key={severity} variant={getSeverityVariant(severity)}>
              {count} {severity.toUpperCase()}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-3">
          {allCVEs.map((cve, index) => (
            <div key={`${cve.cve_id}-${index}`} className="border-l-2 border-muted pl-3 space-y-1">
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
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {cve.cve_description}
              </p>
              {Array.isArray(cve.affected_products) && cve.affected_products.length > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  {cve.affected_products[0]}
                  {cve.affected_products.length > 1 && ` +${cve.affected_products.length - 1} more`}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}