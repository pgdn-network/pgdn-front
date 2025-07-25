import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationsProvider } from './contexts/OrganizationsContext';
import { ProtocolsProvider } from './contexts/ProtocolsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollRestoration } from './components/common/ScrollRestoration';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NodeList from './pages/NodeList';
import NodeCreate from './pages/NodeCreate';
import NodeIps from './pages/NodeIps';
import Scans from './pages/Scans';
import Orchestrations from './pages/Orchestrations';
import Compliance from './pages/Compliance';
import ComplianceDetail from './pages/ComplianceDetail';
import ComplianceTemplates from './pages/ComplianceTemplates';
import ComplianceScan from './pages/ComplianceScan';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Organizations from './pages/Organizations';
import OrgNodeDetail from './pages/OrgNodeDetail';
import OrgNodeCreate from './pages/OrgNodeCreate';
import OrgNodeReports from './pages/OrgNodeReports';
import OrgNodeReportDetail from './pages/OrgNodeReportDetail';
import OrgNodeLedger from './pages/OrgNodeLedger';
import OrgNodeCves from './pages/OrgNodeCves';
import OrgNodeCveDetail from './pages/OrgNodeCveDetail';
import OrgNodeScans from './pages/OrgNodeScans';
import OrgNodeScanDetail from './pages/OrgNodeScanDetail';
import OrgNodeEvents from './pages/OrgNodeEvents';
import OrgNodeSettings from './pages/OrgNodeSettings';
import NodeDiscovery from './pages/NodeDiscovery';
import NotFound from './pages/NotFound';
import PublicNodes from './pages/PublicNodes';
import PublicLayout from './components/layout/PublicLayout';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ScrollRestoration />
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/public" element={<PublicLayout><PublicNodes /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <OrganizationsProvider>
                      <ProtocolsProvider>
                        <NotificationProvider>
                          <WebSocketProvider>
                            <Layout />
                          </WebSocketProvider>
                        </NotificationProvider>
                      </ProtocolsProvider>
                    </OrganizationsProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="nodes" element={<NodeList />} />
                <Route path="nodes/create" element={<NodeCreate />} />
                <Route path="scans" element={<Scans />} />
                <Route path="orchestrations" element={<Orchestrations />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="compliance/:frameworkId" element={<ComplianceDetail />} />
                <Route path="compliance/templates" element={<ComplianceTemplates />} />
                <Route path="compliance/scan" element={<ComplianceScan />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="organizations" element={<Organizations />} />
                {/* TODO: Re-enable when organization detail page is implemented */}
                {/* <Route path="organizations/:slug" element={<OrgNodeList />} /> */}
                <Route path="organizations/:slug/nodes/create" element={<OrgNodeCreate />} />
                <Route path="organizations/:slug/nodes/:nodeId" element={<OrgNodeDetail />} />
                <Route path="organizations/:slug/nodes/:nodeId/ips" element={<NodeIps />} />
                <Route path="organizations/:slug/nodes/:nodeId/reports" element={<OrgNodeReports />} />
                <Route path="organizations/:slug/nodes/:nodeId/reports/:reportUuid" element={<OrgNodeReportDetail />} />
                <Route path="organizations/:slug/nodes/:nodeId/ledger" element={<OrgNodeLedger />} />
                <Route path="organizations/:slug/nodes/:nodeId/scans" element={<OrgNodeScans />} />
                <Route path="organizations/:slug/nodes/:nodeId/scans/:scanId" element={<OrgNodeScanDetail />} />
                <Route path="organizations/:slug/nodes/:nodeId/reports/:reportUuid" element={<OrgNodeReportDetail />} />
                <Route path="organizations/:slug/nodes/:nodeId/cves" element={<OrgNodeCves />} />
                <Route path="organizations/:slug/nodes/:nodeId/cves/:cveUuid" element={<OrgNodeCveDetail />} />
                <Route path="organizations/:slug/nodes/:nodeId/history" element={<OrgNodeEvents />} />
                <Route path="organizations/:slug/nodes/:nodeId/settings" element={<OrgNodeSettings />} />
                <Route path="organizations/:slug/nodes/:nodeUuid/discovery" element={<NodeDiscovery />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ScrollToTopButton />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
