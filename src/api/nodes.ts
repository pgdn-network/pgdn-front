import { apiService } from '@/services/api';
import type { 
  Node, 
  NodeCveResponse, 
  NodeEventsResponse, 
  NodeTasksResponse, 
  NodeScanSessionsResponse,
  NodeReportsResponse,
  NodeStatus,
  ScanSessionResponse,
  ScanSessionStatus,
  NodeIpsResponse,
  NodeReport,
  CveMatch,
  NodeSnapshot,
  CreateNodeResponse,
  ClaimNodeResponse,
  PublicClaim,
  NodeActionsResponse,
  PublicNode
} from '@/types/node';

export class NodeApiService {
  private static baseUrl = '/organizations';

  static async getNode(organizationUuid: string, nodeUuid: string): Promise<Node> {
    const response = await apiService.get<Node>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`
    );
    return response.data;
  }

  static async getNodeCveMatches(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeCveResponse> {
    const response = await apiService.get<NodeCveResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/cve-matches?fixed_status=open&limit=${limit}`
    );
    return response.data;
  }

  static async getNodeCveMatch(organizationUuid: string, nodeUuid: string, cveUuid: string): Promise<CveMatch> {
    const response = await apiService.get<CveMatch>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/cve-matches/${cveUuid}`
    );
    return response.data;
  }

  static async getNodes(organizationUuid: string, limit: number = 50, offset: number = 0, search?: string): Promise<{ nodes: Node[], total: number }> {
    let url;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      detailed: 'true'
    });
    
    if (search && search.trim() && search.trim().length >= 3) {
      params.set('search', search.trim());
    }
    
    if (!organizationUuid || organizationUuid === 'all') {
      url = `/nodes?${params.toString()}`;
    } else {
      url = `${this.baseUrl}/${organizationUuid}/nodes?${params.toString()}`;
    }
    const response = await apiService.get(url);
    // If the response is an object with a nodes array, return that
    if (response.data && Array.isArray(response.data.nodes)) {
      return {
        nodes: response.data.nodes,
        total: response.data.total || response.data.nodes.length
      };
    }
    // Otherwise, assume the response is already an array
    return {
      nodes: response.data,
      total: response.data.length
    };
  }

  static async createNode(organizationUuid: string, nodeData: Partial<Node>): Promise<CreateNodeResponse> {
    const response = await apiService.post<CreateNodeResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes`,
      nodeData
    );
    return response.data;
  }

  static async updateNode(organizationUuid: string, nodeUuid: string, nodeData: Partial<Node>): Promise<Node> {
    const response = await apiService.put<Node>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`,
      nodeData
    );
    return response.data;
  }

  static async patchNode(organizationUuid: string, nodeUuid: string, nodeData: Partial<Node>): Promise<Node> {
    const response = await apiService.patch<Node>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`,
      nodeData
    );
    return response.data;
  }

  static async deleteNode(organizationUuid: string, nodeUuid: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`);
  }

  static async getNodeEvents(organizationUuid: string, nodeUuid: string, limit: number = 10, offset: number = 0): Promise<NodeEventsResponse> {
    const response = await apiService.get<NodeEventsResponse>(
      `/organizations/${organizationUuid}/nodes/${nodeUuid}/node-events?limit=${limit}&offset=${offset}`
    );
    return response.data;
  }

  static async getNodeTasks(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeTasksResponse> {
    const response = await apiService.get<NodeTasksResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/tasks?limit=${limit}&simple=true`
    );
    return response.data;
  }

  static async getNodeScanSessions(organizationUuid: string, nodeUuid: string, limit: number = 5, offset: number = 0): Promise<NodeScanSessionsResponse> {
    const url = `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/sessions?limit=${limit}&offset=${offset}`;
    const response = await apiService.get<NodeScanSessionsResponse>(url);
    return response.data;
  }

  static async getNodeRunningScanSessions(organizationUuid: string, nodeUuid: string, limit: number = 50): Promise<NodeScanSessionsResponse> {
    const url = `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/sessions?scan_status=running&limit=${limit}`;
    const response = await apiService.get<NodeScanSessionsResponse>(url);
    return response.data;
  }

  static async getNodeReports(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeReportsResponse> {
    const response = await apiService.get<NodeReportsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/reports?limit=${limit}`
    );
    return response.data;
  }

  static async getNodeReport(organizationUuid: string, nodeUuid: string, reportUuid: string): Promise<NodeReport> {
    const response = await apiService.get<NodeReport>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/reports/${reportUuid}`
    );
    return response.data;
  }

  static async getNodeStatus(organizationUuid: string, nodeUuid: string): Promise<NodeStatus> {
    const response = await apiService.get<NodeStatus>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/status`
    );
    return response.data;
  }

  static async startNodeScan(organizationUuid: string, nodeUuid: string, scanners: string[], ports?: number[]): Promise<ScanSessionResponse> {
    const body: { scanners: string[]; ports?: number[] } = { scanners };
    if (ports && ports.length > 0) {
      body.ports = ports;
    }
    
    const response = await apiService.post<ScanSessionResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/scan`,
      body
    );
    return response.data;
  }

  static async getScanSession(sessionUrl: string): Promise<ScanSessionStatus> {
    // Normalize the URL to remove /api/v1 prefix if it exists
    // This prevents double /api/v1/api/v1 in the URL
    const normalizedUrl = sessionUrl.startsWith('/api/v1/') 
      ? sessionUrl.substring(7) // Remove '/api/v1' prefix
      : sessionUrl;
    
    const response = await apiService.get<ScanSessionStatus>(normalizedUrl);
    return response.data;
  }

  static async getTaskStatus(taskUrl: string): Promise<any> {
    // Normalize the URL to remove /api/v1 prefix if it exists
    const normalizedUrl = taskUrl.startsWith('/api/v1/') 
      ? taskUrl.substring(7) // Remove '/api/v1' prefix
      : taskUrl;
    
    const response = await apiService.get<any>(normalizedUrl);
    return response.data;
  }

  static async getNodeIps(
    organizationUuid: string, 
    nodeUuid: string, 
    activeOnly: boolean = true
  ): Promise<NodeIpsResponse> {
    const params = new URLSearchParams();
    params.append('active_only', activeOnly.toString());
    
    const response = await apiService.get<NodeIpsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/node_ips?${params.toString()}`
    );
    return response.data;
  }

  static async getNodeSnapshot(organizationUuid: string, nodeUuid: string): Promise<NodeSnapshot> {
    const response = await apiService.get<NodeSnapshot>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/snapshot`
    );
    return response.data;
  }

  // Claim a public node
  static async claimNode(claimEndpoint: string): Promise<ClaimNodeResponse> {
    // claimEndpoint is a full path like /api/v1/public/nodes/:uuid/claim
    // Remove /api/v1 prefix if present (apiService adds it)
    const normalized = claimEndpoint.startsWith('/api/v1') ? claimEndpoint.substring(7) : claimEndpoint;
    const response = await apiService.post<ClaimNodeResponse>(normalized);
    return response.data;
  }

  // Get all public claims for the current user/org
  static async getPublicClaims(): Promise<PublicClaim[]> {
    const response = await apiService.get<PublicClaim[]>('/public/claims');
    return response.data;
  }

  // Get all public nodes
  static async getPublicNodes(search?: string): Promise<PublicNode[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    const url = `/public/nodes${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<PublicNode[]>(url);
    return response.data;
  }

  static async getNodeActions(organizationUuid: string, nodeUuid: string, status: string = 'open', limit: number = 10): Promise<NodeActionsResponse> {
    const response = await apiService.get<NodeActionsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/actions?status=${status}&limit=${limit}`
    );
    return response.data;
  }

  static async patchNodeAction(
    organizationUuid: string,
    nodeUuid: string,
    actionUuid: string,
    body: { status: string }
  ) {
    const response = await apiService.patch(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/actions/${actionUuid}`,
      body
    );
    return response.data;
  }

  static async getNodeSessionDetail(organizationUuid: string, nodeUuid: string, scanId: string): Promise<any> {
    const response = await apiService.get<any>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/sessions/${scanId}`
    );
    return response.data;
  }

  static async publishNodeReport(
    organizationUuid: string, 
    nodeUuid: string, 
    reportUuid: string, 
    network: 'sui' | 'zksync'
  ): Promise<any> {
    const response = await apiService.post<any>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/reports/${reportUuid}/publish`,
      { network }
    );
    return response.data;
  }

  static async getNodeLedgerPublishes(
    organizationUuid: string, 
    nodeUuid: string, 
    reportUuid?: string
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (reportUuid) {
      params.append('report_uuid', reportUuid);
    }
    
    const url = `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/ledger-publishes${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<{publishes: any[], total: number, limit: number, offset: number, node_uuid: string, node_name: string, node_address: string}>(url);
    return response.data.publishes;
  }
}

export default NodeApiService;