import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PendingPage from './pages/PendingPage';
import DashboardPage from './pages/DashboardPage';
import PlatformsPage from './pages/PlatformsPage';
import TemplatesPage from './pages/TemplatesPage';
import ChatPage from './pages/ChatPage';
import NetworkPage from './pages/NetworkPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ModeratorPage from './pages/ModeratorPage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Auth Guards ─────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequireApproved({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (userProfile?.status !== 'approved') return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

function RequireModerator({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || !userProfile) return <Navigate to="/login" replace />;
  if (userProfile.role !== 'admin' && userProfile.role !== 'moderator') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, isOwner } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || !userProfile) return <Navigate to="/login" replace />;
  if (userProfile.role !== 'admin' && !isOwner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user && userProfile?.status === 'approved') return <Navigate to="/dashboard" replace />;
  if (user && userProfile?.status !== 'approved') return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

// ─── Protected Layout Wrapper ─────────────────────────────────
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireApproved>
      <AppLayout>{children}</AppLayout>
    </RequireApproved>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
      <Route path="/register" element={<RedirectIfAuth><LoginPage defaultMode="register" /></RedirectIfAuth>} />

      {/* Pending (auth required, any status) */}
      <Route path="/pending" element={<RequireAuth><PendingPage /></RequireAuth>} />

      {/* Protected (approved only) */}
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/network"   element={<ProtectedLayout><NetworkPage /></ProtectedLayout>} />
      <Route path="/platforms" element={<ProtectedLayout><PlatformsPage /></ProtectedLayout>} />
      <Route path="/templates" element={<ProtectedLayout><TemplatesPage /></ProtectedLayout>} />
      <Route path="/chat"      element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />
      <Route path="/profile"   element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="/profile/:userId" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

      {/* Moderator */}
      <Route path="/moderator" element={
        <RequireModerator><AppLayout><ModeratorPage /></AppLayout></RequireModerator>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <RequireAdmin><AppLayout><AdminPage /></AppLayout></RequireAdmin>
      } />

      {/* Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
