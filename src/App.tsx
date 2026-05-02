import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WardenDashboard from "./pages/warden/WardenDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

// Management Pages
import StudentManagement from "./pages/admin/StudentManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import HostelManagement from "./pages/admin/HostelManagement";
import FeeManagement from "./pages/FeeManagement";
import ComplaintManagement from "./pages/ComplaintManagement";
import AttendancePage from "./pages/AttendancePage";
import AnnouncementPage from "./pages/AnnouncementPage";
import VisitorManagement from "./pages/VisitorManagement";
import SecurityPage from "./pages/SecurityPage";
import LoginPage from "./pages/LoginPage";

import { ShieldAlert } from "lucide-react";

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-xl border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-600/20" />
      </div>
    );
  }

  // Not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but checking roles
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  
  if (loading) return null;
  
  switch(role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'warden': return <Navigate to="/warden" replace />;
    case 'student': return <Navigate to="/student" replace />;
    default: return <Navigate to="/admin" replace />; // Default to admin for demo
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <StudentManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <RoomManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/hostels" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <HostelManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Warden Routes */}
          <Route path="/warden" element={
            <ProtectedRoute allowedRoles={['warden']}>
              <DashboardLayout>
                <WardenDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path="/fees" element={
            <ProtectedRoute>
              <DashboardLayout>
                <FeeManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/complaints" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ComplaintManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['admin', 'warden']}>
              <DashboardLayout>
                <AttendancePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnnouncementPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/visitors" element={
            <ProtectedRoute allowedRoles={['admin', 'warden']}>
              <DashboardLayout>
                <VisitorManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/security" element={
            <ProtectedRoute>
              <DashboardLayout>
                <SecurityPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
