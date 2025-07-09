import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileText, Shield, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import type { NodeReport } from '@/types/node'

interface ReportsCardProps {
  reports: NodeReport[] | null | undefined
  organizationSlug?: string
  nodeId?: string
}

function getRiskScoreVariant(score: number): 'destructive' | 'secondary' | 'default' {
  if (score >= 15) return 'destructive'
  if (score >= 10) return 'secondary'
  return 'default'
}

function getRiskScoreLabel(score: number): string {
  if (score >= 15) return 'Critical'
  if (score >= 10) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function ReportsCard({ reports, organizationSlug, nodeId }: ReportsCardProps) {
  // Ensure reports is an array and handle null/undefined cases
  const safeReports = Array.isArray(reports) ? reports : []
  
  if (!safeReports || safeReports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Security Reports
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              No reports
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No security reports available</p>
        </CardContent>
      </Card>
    )
  }

  const reportTypeCount = safeReports.reduce((acc, report) => {
    acc[report.report_type] = (acc[report.report_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Security Reports
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              {safeReports.length} report{safeReports.length !== 1 ? 's' : ''}
            </span>
            {organizationSlug && nodeId && (
              <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/reports`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </Link>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(reportTypeCount).map(([type, count]) => (
            <Badge key={type} variant="outline">
              {count} {type.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-4">
          {safeReports.slice(0, 3).map((report) => (
            <div key={report.uuid} className="border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium text-sm leading-none">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.summary}</p>
                </div>
                <Badge 
                  variant={getRiskScoreVariant(report.risk_score)}
                  className="ml-2 shrink-0"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {getRiskScoreLabel(report.risk_score)} Risk ({report.risk_score})
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {report.report_type.replace(/_/g, ' ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                  <div className="font-mono">
                    Session: {report.scan_session_id}
                  </div>
                </div>
                {organizationSlug && nodeId && (
                  <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/reports/${report.uuid}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {safeReports.length > 3 && organizationSlug && nodeId && (
          <div className="text-center pt-2">
            <Link to={`/organizations/${organizationSlug}/nodes/${nodeId}/reports`}>
              <Button variant="outline" size="sm">
                View {safeReports.length - 3} more reports
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
