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
  id: string;
  cve_id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss_score: number;
  published_date: string;
  last_modified: string;
  affected_software: string;
  fixed_version?: string;
  references: string[];
}

export interface NodeCveResponse {
  node_uuid: string;
  total_matches: number;
  matches: CveMatch[];
}