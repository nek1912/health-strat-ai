import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import NotFound from "./pages/NotFound";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const ProtectedRoute = ({ user }: { user: User | null }) => {
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
};

const RoleRoute = ({ user, allow }: { user: User | null; allow: Array<string> }) => {
  if (!user) return <Navigate to="/auth" replace />;
  const role = (user.user_metadata?.role as string) || "";
  if (!allow.includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public home and auth */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Authenticated area */}
            <Route element={<ProtectedRoute user={user} />}> 
              {/* General dashboard accessible to any authenticated user */}
              <Route path="/dashboard" element={<Dashboard userEmail={user?.email || "user@healthai.local"} />} />

              {/* Role-based routes */}
              <Route element={<RoleRoute user={user} allow={["doctor"]} />}>
                <Route path="/doctor" element={<DoctorDashboard />} />
              </Route>
              <Route element={<RoleRoute user={user} allow={["admin","hospital"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route element={<RoleRoute user={user} allow={["patient"]} />}>
                <Route path="/patient" element={<PatientDashboard />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
