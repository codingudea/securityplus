import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Diagnostico from "@/pages/Diagnostico";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminCuestionario from "@/pages/AdminCuestionario";
import MisDiagnosticos from "@/pages/MisDiagnosticos";
import NotFound from "@/pages/NotFound";
import type { ReactNode } from "react";

function ProtectedRoute({ children, role }: { children: ReactNode; role?: string }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diagnostico" element={<Diagnostico />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cuestionario"
          element={
            <ProtectedRoute role="admin">
              <AdminCuestionario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empresa/mis-diagnosticos"
          element={
            <ProtectedRoute role="empresa">
              <MisDiagnosticos />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
