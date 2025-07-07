import { apiService } from '@/services/api';
import type { 
  Node, 
  NodeCveResponse, 
  NodeEventsResponse, 
  NodeInterventionsResponse, 
  NodeTasksResponse, 
  NodeScanSessionsResponse,
  NodeReportsResponse,
  NodeStatus,
  ScanSessionResponse,
  ScanSessionStatus,
  NodeIpsResponse,
  NodeReport
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

  static async getNodes(organizationUuid: string, limit: number = 50): Promise<Node[]> {
    const response = await apiService.get<Node[]>(
      `${this.baseUrl}/${organizationUuid}/nodes?limit=${limit}`
    );
    return response.data;
  }

  static async createNode(organizationUuid: string, nodeData: Partial<Node>): Promise<Node> {
    const response = await apiService.post<Node>(
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

  static async deleteNode(organizationUuid: string, nodeUuid: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`);
  }

  static async getNodeEvents(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeEventsResponse> {
    const response = await apiService.get<NodeEventsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/events?limit=${limit}`
    );
    return response.data;
  }

  static async getNodeInterventions(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeInterventionsResponse> {
    const response = await apiService.get<NodeInterventionsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/interventions?limit=${limit}`
    );
    return response.data;
  }

  static async getNodeTasks(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeTasksResponse> {
    const response = await apiService.get<NodeTasksResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/tasks?limit=${limit}`
    );
    return response.data;
  }

  static async getNodeScanSessions(organizationUuid: string, nodeUuid: string, limit: number = 5): Promise<NodeScanSessionsResponse> {
    const response = await apiService.get<NodeScanSessionsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/scans?limit=${limit}`
    );
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

  static async startNodeScan(organizationUuid: string, nodeUuid: string, scanners: string[]): Promise<ScanSessionResponse> {
    const response = await apiService.post<ScanSessionResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/scan`,
      { scanners }
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
}

export default NodeApiService;