export interface NodeMeta {
  created_from_intervention?: boolean;
  created_by_user_uuid?: string;
  validated_ip?: string;
  notes?: string;
}

export interface ProtocolDetails {
  uuid: string;
  name: string;
  display_name: string;
  category: string;
  ports: number[];
  endpoints: string[];
}

export interface ResolvedIp {
  uuid: string;
  ip_address: string;
  resolved_at: string;
  active: boolean;
  notes?: string;
}

export interface CveSummary {
  total_cves: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

export interface Node {
  uuid: string;
  organization_uuid: string;
  name: string;
  address: string;
  active: boolean;
  status: string;
  current_state: string;
  meta: NodeMeta;
  created_at: string;
  updated_at: string;
  protocol_details: ProtocolDetails;
  last_scan_session: string | null;
  resolved_ips: ResolvedIp[];
  cve_summary: CveSummary;
  total_scan_sessions: number;
  total_reports: number;
}

export interface CveMatch {
  match_uuid: string;
  cve_id: string;
  confidence_score: number;
  match_type: string;
  match_reason: string;
  severity: string;
  cvss_score: number;
  affected_products: string[];
  matched_at: string;
  cve_description: string;
  cve_published_date: string;
  cve_last_modified: string;
  cve_cvss_vector: string;
  cve_source: string | null;
  cve_references: string[] | null;
  cwe_ids: string[] | null;
  attack_vector: string | null;
  attack_complexity: string | null;
  privileges_required: string | null;
  user_interaction: string | null;
  scope: string | null;
  confidentiality_impact: string | null;
  integrity_impact: string | null;
  availability_impact: string | null;
  fixed: boolean;
  date_fixed: string | null;
  fixed_version: string | null;
  fixed_by_user_uuid: string | null;
  fixed_notes: string | null;
  fix_info: {
    fix_available: boolean;
    patch_version: string | null;
    vendor_advisory_url: string | null;
    remediation_steps: string | null;
    workaround: string | null;
    fixed_versions: string[] | null;
    vendor_urls: string[] | null;
    patch_urls: string[] | null;
    mitigation_strategies: string[] | null;
  };
  scan_date: string;
  target_ip: string | null;
}

export type NodeCveResponse = CveMatch[];

// Events
export interface NodeEvent {
  uuid: string;
  node_uuid: string;
  user_uuid: string;
  organization_uuid: string;
  orchestrator_type: string;
  input_state: {
    scan_level: number;
    timeout_minutes: number;
    enable_deep_scan: boolean;
    parallel_processing: boolean;
  };
  decision: {
    scan_session_id: string;
  };
  executed_action: string;
  action_status: string;
  created_at: string;
}

export interface NodeEventsResponse {
  events: NodeEvent[];
  total: number;
  node_uuid: string;
  node_name: string;
  node_address: string;
  organization_uuid: string;
}

// Interventions
export interface NodeIntervention {
  uuid: string;
  related_uuid: string;
  related_type: string;
  reason: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_by: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface NodeInterventionsResponse {
  interventions: NodeIntervention[];
  total: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  node_uuid: string;
  node_name: string;
  node_address: string;
  organization_uuid: string;
}

// Tasks
export interface NodeTask {
  id: string;
  status: string;
  task_type: string;
  created_at: string;
  updated_at: string;
  // Will be updated with actual response structure
}

export interface NodeTasksResponse {
  tasks: NodeTask[];
  // Will be updated with actual response structure
}

// Scan Sessions
export interface NodeScanSession {
  scan_id: string;
  node_uuid: string;
  organization_uuid: string;
  target: string | null;
  protocol_filter: string | null;
  scan_level: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface NodeScanSessionsResponse {
  scans: NodeScanSession[];
  total: number;
  node_uuid: string;
  node_name: string;
  node_address: string;
  organization_uuid: string;
}

// Reports
export interface ReportFinding {
  issue: string;
  evidence: string;
  maya_analysis: string;
  exploitation_ease: string;
}

export interface ReportFindings {
  urgent_fixes: ReportFinding[];
  critical_risks: ReportFinding[];
  convenient_fixes: ReportFinding[];
  documentation_items: ReportFinding[];
}

export interface ReportMetadata {
  persona: string;
  scan_id: string;
  report_type: string;
  api_provider: string;
  generated_at: string;
  analyzer_version: string;
}

export interface NodeReport {
  uuid: string;
  scan_session_id: number;
  session_id: string;
  node_uuid: string;
  organization_uuid: string;
  report_type: string;
  title: string;
  summary: string;
  findings?: ReportFindings;
  risk_score: number;
  report_metadata?: ReportMetadata;
  created_at: string;
  updated_at: string | null;
}

export interface NodeReportsResponse {
  reports: NodeReport[];
  total: number;
  organization_uuid: string;
  node_uuid: string;
}

// Node Status
export interface NodeStatus {
  node_uuid: string;
  node_name: string;
  node_address: string;
  organization_uuid: string;
  operational_status: string;
  status_message: string;
  last_checked: string;
  last_scan_date: string;
  last_scan_status: string;
  next_scheduled_scan: string | null;
  active_tasks_count: number;
  failed_tasks_count: number;
  open_interventions_count: number;
  critical_interventions_count: number;
  connectivity_status: string;
  scan_health: string;
  avg_scan_duration: number;
  success_rate: number;
}

// Scan Session Response Types
export interface ScanInfo {
  id: string;
  scan_type: string;
  target: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  task_id: string | null;
  tracking_url: string | null;
  created_at: string;
  completed_at?: string;
  progress?: number;
}

export interface TrackingUrls {
  session: string;
  scans: string[];
  scan_tasks?: string[];
}

export interface ScanSessionResponse {
  message: string;
  session_id: string;
  node_uuid: string;
  organization_uuid: string;
  total_scans: number;
  scan_level: number;
  scanners: string[];
  task_ids: string[];
  tracking_urls: TrackingUrls;
  scans: ScanInfo[];
  created_at: string;
}

export interface ScanSessionStatus {
  session_id: string;
  node_uuid: string;
  organization_uuid: string;
  status: 'running' | 'completed' | 'failed';
  total_scans: number;
  completed_scans: number;
  failed_scans: number;
  scans: ScanInfo[];
  created_at: string;
  completed_at?: string;
}

export interface NodeIp {
  uuid: string;
  node_id: number;
  ip_address: string;
  resolved_at: string;
  active: boolean;
}

export interface NodeIpsResponse {
  node_ips: NodeIp[];
  total: number;
  node_uuid: string;
  node_name: string;
  node_address: string;
  organization_uuid: string;
}