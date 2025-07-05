import { apiService } from '@/services/api';
import type { Node, NodeCveResponse } from '@/types/node';

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
      `${this.baseUrl}/${organizationUuid}/nodes/${nodeUuid}/cve-matches`
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
}

export default NodeApiService;