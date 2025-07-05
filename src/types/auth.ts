export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  org_uuid: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface JWTPayload {
  sub: string;
  user_id: number;
  org_uuid: string;
  role: string;
  first_name?: string;
  exp: number;
  type: 'access' | 'refresh';
}