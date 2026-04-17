import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import ClickSpark from "./components/click-animation/clickEffect";

// Public pages
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import LandingPage from "./pages/landingPage";
import AnnouncementsPage from "./pages/announcementPage";

// Church auth + registration
import ChurchLogin from "./pages/churchLogin";
import RegistrationForm from "./pages/registrationForm";
import ChurchAdminDashboard from "./pages/churchAdminDashboard";

// Super admin
import SuperAdminLogin from "./pages/admin/superAdminLogin";
import AdminDashboard from "./pages/admin/adminDashboard";
import AdminAnnouncements from "./pages/admin/adminAnnouncements";
import AdminAddAnnouncement from "./pages/admin/adminAddAnnouncement";
import AdminRegistrations from "./pages/admin/adminRegistrations";
import AdminFinancials from "./pages/admin/adminFinancials";

// for dev only
import DevLogin     from "./pages/dev/devLogin";
import DevDashboard from "./pages/dev/devDashboard";
import DevGuard     from "./pages/dev/devGuard";

import { useAuth } from "./context/authContext";

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-[#010101] text-[#F1F1F1]">
    <Navbar />
    {children}
    <Footer />
  </div>
);

const ProtectedChurchRoute = ({ children }) => {
  const { churchAdmin } = useAuth();
  if (!churchAdmin) return <Navigate to="/register" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { superAdmin } = useAuth();
  if (!superAdmin) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <ClickSpark
      sparkColor="#f1f1f1f1"
      sparkCount={10}
      sparkSize={12}
      sparkRadius={20}
      duration={500}
    >
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/announcements"
          element={
            <PublicLayout>
              <AnnouncementsPage />
            </PublicLayout>
          }
        />

        {/* Church registration flow */}
        <Route path="/register" element={<ChurchLogin />} />
        <Route
          path="/register/form"
          element={
            <ProtectedChurchRoute>
              <RegistrationForm />
            </ProtectedChurchRoute>
          }
        />
        <Route
          path="/register/dashboard"
          element={
            <ProtectedChurchRoute>
              <ChurchAdminDashboard />
            </ProtectedChurchRoute>
          }
        />

        {/* Super Admin */}
        <Route path="/admin" element={<SuperAdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedAdminRoute>
              <AdminAnnouncements />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/announcements/add"
          element={
            <ProtectedAdminRoute>
              <AdminAddAnnouncement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/announcements/edit/:id"
          element={
            <ProtectedAdminRoute>
              <AdminAddAnnouncement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <ProtectedAdminRoute>
              <AdminRegistrations />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/financials"
          element={
            <ProtectedAdminRoute>
              <AdminFinancials />
            </ProtectedAdminRoute>
          }
        />

        <Route path="/dev" element={<DevLogin />} />
        <Route path="/dev/dashboard" element={
          <DevGuard>
            <DevDashboard />
          </DevGuard>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClickSpark>
  );
}

import PwaInstallPrompt from "./components/pwaInstallPrompt";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <PwaInstallPrompt />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#0A1614",
            color: "#F1F1F1",
            border: "1px solid rgba(197,197,197,0.2)",
            fontFamily: "Manrope, sans-serif",
            fontWeight: "600",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#0A1614" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#0A1614" },
          },
        }}
      />
    </AuthProvider>
  );
}
