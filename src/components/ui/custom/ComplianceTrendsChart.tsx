import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComplianceTrend } from '@/types/compliance';

interface ComplianceTrendsChartProps {
  data: ComplianceTrend[];
  framework?: string;
  className?: string;
}

export function ComplianceTrendsChart({ data, framework, className }: ComplianceTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Compliance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate min/max for scaling
  const complianceValues = sortedData.map(d => d.compliance);
  const minCompliance = Math.min(...complianceValues);
  const maxCompliance = Math.max(...complianceValues);
  const range = maxCompliance - minCompliance;
  
  // Chart dimensions
  const chartHeight = 200;
  const chartWidth = 100;
  const padding = 20;
  const availableHeight = chartHeight - (padding * 2);
  const availableWidth = chartWidth - (padding * 2);

  // Generate SVG path
  const points = sortedData.map((point, index) => {
    const x = padding + (index / (sortedData.length - 1)) * availableWidth;
    const y = padding + availableHeight - ((point.compliance - minCompliance) / range) * availableHeight;
    return `${x},${y}`;
  });

  const pathData = points.length > 1 ? `M ${points.join(' L ')}` : '';

  // Calculate trend direction
  const firstValue = sortedData[0]?.compliance || 0;
  const lastValue = sortedData[sortedData.length - 1]?.compliance || 0;
  const trendDirection = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  const trendColor = trendDirection === 'up' ? 'text-success' : trendDirection === 'down' ? 'text-destructive' : 'text-muted';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Compliance Trends</span>
          {framework && (
            <span className="text-sm font-normal text-muted">{framework.toUpperCase()}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">
              {sortedData.length} data points
            </div>
            <div className={`text-sm font-medium ${trendColor}`}>
              {trendDirection === 'up' && '+'}
              {((lastValue - firstValue) / firstValue * 100).toFixed(1)}% change
            </div>
          </div>

          {/* Chart */}
          <div className="relative">
            <svg 
              width="100%" 
              height={chartHeight} 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full"
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((value) => {
                const y = padding + availableHeight - ((value - minCompliance) / range) * availableHeight;
                return (
                  <line
                    key={value}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              })}

              {/* Chart line */}
              {pathData && (
                <path
                  d={pathData}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-primary"
                />
              )}

              {/* Data points */}
              {sortedData.map((point, index) => {
                const x = padding + (index / (sortedData.length - 1)) * availableWidth;
                const y = padding + availableHeight - ((point.compliance - minCompliance) / range) * availableHeight;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="currentColor"
                    className="text-primary"
                  />
                );
              })}

              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map((value) => {
                const y = padding + availableHeight - ((value - minCompliance) / range) * availableHeight;
                return (
                  <text
                    key={value}
                    x={padding - 5}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {value}%
                  </text>
                );
              })}

              {/* X-axis labels */}
              {sortedData.length <= 5 && sortedData.map((point, index) => {
                const x = padding + (index / (sortedData.length - 1)) * availableWidth;
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {new Date(point.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{firstValue}%</div>
              <div className="text-xs text-muted">Start</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{lastValue}%</div>
              <div className="text-xs text-muted">Current</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {Math.round(sortedData.reduce((sum, d) => sum + d.compliance, 0) / sortedData.length)}%
              </div>
              <div className="text-xs text-muted">Average</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 