import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdminRoute, PrivateRoute } from './routes/Guards.jsx';
import AdminPage from './pages/AdminPage.jsx';
import BugDetailPage from './pages/BugDetailPage.jsx';
import BugListPage from './pages/BugListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProjectListPage from './pages/ProjectListPage.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route element={<PrivateRoute />}>
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id/bugs" element={<BugListPage />} />
            <Route path="/bugs/:id" element={<BugDetailPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
