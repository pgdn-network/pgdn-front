import { apiService } from '@/services/api';

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

export interface RegisterResponse {
  id: number;
  uuid: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  message: string;
}

export interface ApiErrorDetail {
  message: string;
  recommendation: string;
}

export interface ValidationError {
  type: string;
  loc: string[];
  msg: string;
  input: string;
  ctx: Record<string, unknown>;
}

export interface ApiErrorResponse {
  detail: ApiErrorDetail | ValidationError[];
}

export class AuthApiService {
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiService.post<RegisterResponse>('/register', data);
    return response.data;
  }
}

export default AuthApiService;