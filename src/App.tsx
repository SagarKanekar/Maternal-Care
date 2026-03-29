import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MotherDashboard from "./pages/MotherDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Questionnaire from "./pages/Questionnaire";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, RoleRoute } from "./components/auth/RouteGuards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/mother-dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute role="mother">
                    <MotherDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute role="doctor">
                    <DoctorDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/contact" element={<Contact />} />

            {/* ML/Firebase pipeline demo */}
            <Route path="/pipeline" element={<Dashboard />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
