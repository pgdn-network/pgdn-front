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