import React from 'react'
import { CVECard } from '@/components/ui/custom/CVECard'
import { Button } from '@/components/ui/button'

export const ErrorTest: React.FC = () => {
  const [testCase, setTestCase] = React.useState<'null' | 'undefined' | 'string' | 'object' | 'array'>('array')
  
  const getTestData = () => {
    switch (testCase) {
      case 'null':
        return null
      case 'undefined':
        return undefined
      case 'string':
        return 'not an array' as any
      case 'object':
        return { not: 'an array' } as any
      case 'array':
        return [
          {
            match_uuid: 'test-1',
            cve_id: 'CVE-2023-1234',
            confidence_score: 0.9,
            match_type: 'exact',
            match_reason: 'Test match',
            severity: 'high',
            cvss_score: 8.5,
            affected_products: ['test-product'],
            matched_at: '2023-01-01T00:00:00Z',
            cve_description: 'Test CVE description',
            cve_published_date: '2023-01-01',
            cve_last_modified: '2023-01-01',
            cve_cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            cve_source: 'test',
            cve_references: [],
            cwe_ids: [],
            attack_vector: 'Network',
            attack_complexity: 'Low',
            privileges_required: 'None',
            user_interaction: 'None',
            scope: 'Unchanged',
            confidentiality_impact: 'High',
            integrity_impact: 'High',
            availability_impact: 'High',
            fixed: false,
            date_fixed: null,
            fixed_version: null,
            fixed_by_user_uuid: null,
            fixed_notes: null,
            fix_info: {
              fix_available: false,
              patch_version: null,
              vendor_advisory_url: null,
              remediation_steps: null,
              workaround: null,
              fixed_versions: null,
              vendor_urls: null,
              patch_urls: null,
              mitigation_strategies: null,
            },
            scan_date: '2023-01-01',
            target_ip: '192.168.1.1',
          }
        ]
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Error Handling Test</h2>
      <p className="text-muted-foreground">
        This component tests the CVECard with different data types to ensure it doesn't crash.
      </p>
      
      <div className="flex gap-2">
        <Button 
          variant={testCase === 'null' ? 'default' : 'outline'}
          onClick={() => setTestCase('null')}
        >
          Test null
        </Button>
        <Button 
          variant={testCase === 'undefined' ? 'default' : 'outline'}
          onClick={() => setTestCase('undefined')}
        >
          Test undefined
        </Button>
        <Button 
          variant={testCase === 'string' ? 'default' : 'outline'}
          onClick={() => setTestCase('string')}
        >
          Test string
        </Button>
        <Button 
          variant={testCase === 'object' ? 'default' : 'outline'}
          onClick={() => setTestCase('object')}
        >
          Test object
        </Button>
        <Button 
          variant={testCase === 'array' ? 'default' : 'outline'}
          onClick={() => setTestCase('array')}
        >
          Test array
        </Button>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Current test case: {testCase}</h3>
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
          {JSON.stringify(getTestData(), null, 2)}
        </pre>
      </div>
      
      <div className="border rounded-lg">
        <CVECard cves={getTestData()} />
      </div>
    </div>
  )
} 