import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, FileText, Shield, Clock } from 'lucide-react'
import type { NodeReport } from '@/types/node'

interface ReportsCardProps {
  reports: NodeReport[]
}

function getRiskScoreVariant(score: number): 'destructive' | 'warning' | 'secondary' | 'success' {
  if (score >= 15) return 'destructive'
  if (score >= 10) return 'warning'
  if (score >= 5) return 'secondary'
  return 'success'
}

function getRiskScoreLabel(score: number): string {
  if (score >= 15) return 'Critical'
  if (score >= 10) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function ReportsCard({ reports }: ReportsCardProps) {
  console.log('ReportsCard received reports:', reports);
  
  if (!reports || reports.length === 0) {
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

  const reportTypeCount = reports.reduce((acc, report) => {
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
          <span className="text-sm font-normal text-muted-foreground">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
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
          {reports.map((report) => (
            <div key={report.uuid} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}