interface Config {
  apiUrl: string;
  apiPrefix: string;
  appName: string;
  appEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  wsUrl: string;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiPrefix: import.meta.env.VITE_API_PREFIX || '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'PGDN',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  wsUrl: import.meta.env.VITE_WS_URL || '',
};

export default config;