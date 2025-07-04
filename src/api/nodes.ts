import { apiService } from '@/services/api';
import type { 
  Node, 
  NodeCveResponse, 
  NodeEventsResponse, 
  NodeInterventionsResponse, 
  NodeTasksResponse, 
  NodeScanSessionsResponse,
  NodeReportsResponse,
  NodeStatus
} from '@/types/node';

export class NodeApiService {
  private static baseUrl = '/organizations';

  static async getNode(organizationUuid: string, nodeUuid: string): Promise<Node> {
    const response = await apiService.get<Node>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}`
    );
    return response.data;
  }

  static async getNodeCveMatches(organizationUuid: string, nodeUuid: string): Promise<NodeCveResponse> {
    const response = await apiService.get<NodeCveResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/cve-matches?fixed_status=open`
    );
    return response.data;
  }

  static async getNodes(organizationUuid: string): Promise<Node[]> {
    const response = await apiService.get<Node[]>(
      `${this.baseUrl}/${organizationUuid}/nodes`
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

  static async getNodeEvents(organizationUuid: string, nodeUuid: string): Promise<NodeEventsResponse> {
    const response = await apiService.get<NodeEventsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/events`
    );
    return response.data;
  }

  static async getNodeInterventions(organizationUuid: string, nodeUuid: string): Promise<NodeInterventionsResponse> {
    const response = await apiService.get<NodeInterventionsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/interventions`
    );
    return response.data;
  }

  static async getNodeTasks(organizationUuid: string, nodeUuid: string): Promise<NodeTasksResponse> {
    const response = await apiService.get<NodeTasksResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/tasks`
    );
    return response.data;
  }

  static async getNodeScanSessions(organizationUuid: string, nodeUuid: string): Promise<NodeScanSessionsResponse> {
    const response = await apiService.get<NodeScanSessionsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/scans`
    );
    return response.data;
  }

  static async getNodeReports(organizationUuid: string, nodeUuid: string): Promise<NodeReportsResponse> {
    const response = await apiService.get<NodeReportsResponse>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/reports`
    );
    return response.data;
  }

  static async getNodeStatus(organizationUuid: string, nodeUuid: string): Promise<NodeStatus> {
    const response = await apiService.get<NodeStatus>(
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/status`
    );
    return response.data;
  }
}

export default NodeApiService;