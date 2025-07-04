import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeProvider';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NodeList from './pages/NodeList';
import NodeDetail from './pages/NodeDetail';
import Scans from './pages/Scans';
import Orchestrations from './pages/Orchestrations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Organizations from './pages/Organizations';
import OrgNodeList from './pages/OrgNodeList';
import OrgNodeDetail from './pages/OrgNodeDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="nodes" element={<NodeList />} />
            <Route path="nodes/:id" element={<NodeDetail />} />
            <Route path="scans" element={<Scans />} />
            <Route path="orchestrations" element={<Orchestrations />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:orgId/nodes" element={<OrgNodeList />} />
            <Route path="organizations/:orgId/nodes/:nodeId" element={<OrgNodeDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
