import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationsProvider } from './contexts/OrganizationsContext';
import { ProtocolsProvider } from './contexts/ProtocolsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NodeList from './pages/NodeList';
import NodeDetail from './pages/NodeDetail';
import NodeCreate from './pages/NodeCreate';
import Scans from './pages/Scans';
import Orchestrations from './pages/Orchestrations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Organizations from './pages/Organizations';
import OrgNodeDetail from './pages/OrgNodeDetail';
import OrgNodeList from './pages/OrgNodeList';
import OrgNodeCreate from './pages/OrgNodeCreate';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <OrganizationsProvider>
            <ProtocolsProvider>
              <NotificationProvider>
                <WebSocketProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="nodes" element={<NodeList />} />
                      <Route path="nodes/create" element={<NodeCreate />} />
                      <Route path="nodes/:id" element={<NodeDetail />} />
                      <Route path="scans" element={<Scans />} />
                      <Route path="orchestrations" element={<Orchestrations />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="organizations" element={<Organizations />} />
                      {/* TODO: Re-enable when organization detail page is implemented */}
                      {/* <Route path="organizations/:slug" element={<OrgNodeList />} /> */}
                      <Route path="organizations/:slug/nodes/create" element={<OrgNodeCreate />} />
                      <Route path="organizations/:slug/nodes/:nodeId" element={<OrgNodeDetail />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </WebSocketProvider>
              </NotificationProvider>
            </ProtocolsProvider>
          </OrganizationsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
