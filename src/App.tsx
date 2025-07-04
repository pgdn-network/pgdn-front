import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import NodeList from './pages/NodeList';
import NodeDetail from './pages/NodeDetail';
import OrgNodeList from './pages/OrgNodeList';
import OrgNodeDetail from './pages/OrgNodeDetail';
import Scans from './pages/Scans';
import Orchestrations from './pages/Orchestrations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/organizations" element={
            <ProtectedRoute>
              <Layout>
                <Organizations />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/nodes" element={
            <ProtectedRoute>
              <Layout>
                <NodeList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/nodes/:id" element={
            <ProtectedRoute>
              <Layout>
                <NodeDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/organization/:orgId" element={
            <ProtectedRoute>
              <Layout>
                <OrgNodeList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/organization/:orgId/nodes/:nodeId" element={
            <ProtectedRoute>
              <Layout>
                <OrgNodeDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/scans" element={
            <ProtectedRoute>
              <Layout>
                <Scans />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orchestrations" element={
            <ProtectedRoute>
              <Layout>
                <Orchestrations />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
