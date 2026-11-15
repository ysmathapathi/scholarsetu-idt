import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminAppShell, ErrorState, LoadingScreen, PublicLayout, StudentAppShell } from "./components/UI";
import { AboutPage, ContactPage, HowItWorksPage, LandingPage, PrivacyPage, ScholarshipDetailPage, ScholarshipListPage } from "./pages/PublicPages";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/AuthPages";
import { ApplicationsPage, DashboardPage, MatchesPage, NotificationsPage, OnboardingPage, ProfilePage, SavedPage, SettingsPage } from "./pages/StudentPages";
import { AdminDashboardPage, AdminScholarshipFormPage, AdminScholarshipsPage, AuditLogPage, DiscoveryReviewPage, SourcesPage } from "./pages/AdminPages";

function ProtectedRoute({ children, admin = false }) {
  const { user, loading, authError } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen label="Checking your session…" />;
  if (authError && !user) return <div className="standalone-state"><ErrorState error={authError} /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  if (admin && user.role !== "admin") return <Navigate to="/access-denied" replace />;
  if (!admin && (user.profileComplete === false || user.profile_complete === false) && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  if (admin) return <AdminAppShell>{children}</AdminAppShell>;
  return <StudentAppShell>{children}</StudentAppShell>;
}

function PublicPage({ children }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function NotFoundPage() {
  return <PublicPage><div className="narrow-page centered-page"><p className="eyebrow">404</p><h1>We can’t find that page</h1><p className="page-description">The page may have moved or the address may be incorrect.</p><a className="button button-primary" href="/">Go to home</a></div></PublicPage>;
}

function AccessDeniedPage() {
  return <PublicPage><div className="narrow-page centered-page"><p className="eyebrow">Access restricted</p><h1>This area isn’t available to your account</h1><p className="page-description">If you believe you should have access, contact your organization administrator.</p><a className="button button-primary" href="/">Return to home</a></div></PublicPage>;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<PublicPage><LandingPage /></PublicPage>} />
    <Route path="/how-it-works" element={<PublicPage><HowItWorksPage /></PublicPage>} />
    <Route path="/scholarships" element={<PublicPage><ScholarshipListPage /></PublicPage>} />
    <Route path="/scholarships/:id" element={<PublicPage><ScholarshipDetailPage /></PublicPage>} />
    <Route path="/about" element={<PublicPage><AboutPage /></PublicPage>} />
    <Route path="/contact" element={<PublicPage><ContactPage /></PublicPage>} />
    <Route path="/privacy" element={<PublicPage><PrivacyPage /></PublicPage>} />
    <Route path="/login" element={<PublicPage><LoginPage /></PublicPage>} />
    <Route path="/register" element={<PublicPage><RegisterPage /></PublicPage>} />
    <Route path="/forgot-password" element={<PublicPage><ForgotPasswordPage /></PublicPage>} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/my-profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
    <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
    <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute admin><AdminDashboardPage /></ProtectedRoute>} />
    <Route path="/admin/scholarships" element={<ProtectedRoute admin><AdminScholarshipsPage /></ProtectedRoute>} />
    <Route path="/admin/scholarships/new" element={<ProtectedRoute admin><AdminScholarshipFormPage /></ProtectedRoute>} />
    <Route path="/admin/scholarships/:id" element={<ProtectedRoute admin><AdminScholarshipFormPage /></ProtectedRoute>} />
    <Route path="/admin/discovered" element={<ProtectedRoute admin><DiscoveryReviewPage /></ProtectedRoute>} />
    <Route path="/admin/sources" element={<ProtectedRoute admin><SourcesPage /></ProtectedRoute>} />
    <Route path="/admin/audit" element={<ProtectedRoute admin><AuditLogPage /></ProtectedRoute>} />
    <Route path="/access-denied" element={<AccessDeniedPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
