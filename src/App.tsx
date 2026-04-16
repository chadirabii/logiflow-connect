import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientDashboard from "./pages/client/ClientDashboard";
import NewBookingPage from "./pages/client/NewBookingPage";
import ClientOrdersPage from "./pages/client/ClientOrdersPage";
import OrderDetailPage from "./pages/client/OrderDetailPage";
import ClientTrackingPage from "./pages/client/ClientTrackingPage";
import ClientDocumentsPage from "./pages/client/ClientDocumentsPage";
import ClientChatPage from "./pages/client/ClientChatPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ClientReclamationsPage from "./pages/client/ClientReclamationsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import AdminShipmentsPage from "./pages/admin/AdminShipmentsPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminDocumentsPage from "./pages/admin/AdminDocumentsPage";
import AdminChatPage from "./pages/admin/AdminChatPage";
import AdminReclamationsPage from "./pages/admin/AdminReclamationsPage";
import AdminLegacyOrdersPage from "./pages/admin/AdminLegacyOrdersPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerOrdersPage from "./pages/manager/ManagerOrdersPage";
import ManagerReclamationsPage from "./pages/manager/ManagerReclamationsPage";
import ManagerChatPage from "./pages/manager/ManagerChatPage";
import ManagerLegacyOrdersPage from "./pages/manager/ManagerLegacyOrdersPage";
import ManagerStatsPage from "./pages/manager/ManagerStatsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'client' | 'admin' | 'manager' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== role) {
    const redirectMap = { admin: '/admin', client: '/client', manager: '/manager' };
    return <Navigate to={redirectMap[user?.role || 'client'] || '/client'} />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StoreProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
              <Route path="/client/booking" element={<ProtectedRoute role="client"><NewBookingPage /></ProtectedRoute>} />
              <Route path="/client/orders" element={<ProtectedRoute role="client"><ClientOrdersPage /></ProtectedRoute>} />
              <Route path="/client/orders/:id" element={<ProtectedRoute role="client"><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/client/tracking" element={<ProtectedRoute role="client"><ClientTrackingPage /></ProtectedRoute>} />
              <Route path="/client/documents" element={<ProtectedRoute role="client"><ClientDocumentsPage /></ProtectedRoute>} />
              <Route path="/client/chat" element={<ProtectedRoute role="client"><ClientChatPage /></ProtectedRoute>} />
              <Route path="/client/profile" element={<ProtectedRoute role="client"><ClientProfilePage /></ProtectedRoute>} />
              <Route path="/client/reclamations" element={<ProtectedRoute role="client"><ClientReclamationsPage /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/requests" element={<ProtectedRoute role="admin"><AdminRequestsPage /></ProtectedRoute>} />
              <Route path="/admin/shipments" element={<ProtectedRoute role="admin"><AdminShipmentsPage /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute role="admin"><AdminClientsPage /></ProtectedRoute>} />
              <Route path="/admin/documents" element={<ProtectedRoute role="admin"><AdminDocumentsPage /></ProtectedRoute>} />
              <Route path="/admin/chat" element={<ProtectedRoute role="admin"><AdminChatPage /></ProtectedRoute>} />
              <Route path="/admin/reclamations" element={<ProtectedRoute role="admin"><AdminReclamationsPage /></ProtectedRoute>} />
              <Route path="/admin/legacy-orders" element={<ProtectedRoute role="admin"><AdminLegacyOrdersPage /></ProtectedRoute>} />

              <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />
              <Route path="/manager/orders" element={<ProtectedRoute role="manager"><ManagerOrdersPage /></ProtectedRoute>} />
              <Route path="/manager/reclamations" element={<ProtectedRoute role="manager"><ManagerReclamationsPage /></ProtectedRoute>} />
              <Route path="/manager/chat" element={<ProtectedRoute role="manager"><ManagerChatPage /></ProtectedRoute>} />
              <Route path="/manager/legacy-orders" element={<ProtectedRoute role="manager"><ManagerLegacyOrdersPage /></ProtectedRoute>} />
              <Route path="/manager/stats" element={<ProtectedRoute role="manager"><ManagerStatsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </StoreProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
