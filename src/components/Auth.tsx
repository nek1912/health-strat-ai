import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DEMO = { email: 'demo@healthai.com', password: 'demo123456' };

// Optional: enable a local demo-auth bypass that doesn't hit Supabase
const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

type Role = 'doctor' | 'admin' | 'hospital' | 'patient';

const roleToRoute: Record<Role, string> = {
  doctor: '/doctor',
  admin: '/admin',
  hospital: '/admin',
  patient: '/patient',
};

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'doctor';
  const [role, setRole] = useState<Role>(initialRole);
  const navigate = useNavigate();

  // Preselect role from query, e.g. /auth?role=doctor
  useEffect(() => {
    const qRole = (searchParams.get('role') || '').toLowerCase();
    if (qRole === 'doctor' || qRole === 'admin' || qRole === 'hospital' || qRole === 'patient') {
      setRole(qRole as Role);
    }
  }, [searchParams]);

  const navigateByRole = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const uRole = (user?.user_metadata?.role as Role) || 'doctor';
    const target = roleToRoute[uRole] || '/';
    navigate(target, { replace: true });
  };

  const navigateToNextOr = (fallback: string) => {
    const next = searchParams.get('next');
    if (next && next.startsWith('/')) {
      navigate(next, { replace: true });
    } else {
      navigate(fallback, { replace: true });
    }
  };

  // Helper for demo-bypass (does not require Supabase session)
  const navigateDirectBySelectedRole = () => {
    // Set a lightweight demo session so route guards allow access
    localStorage.setItem('demo-auth', 'true');
    localStorage.setItem('demo-email', DEMO.email);
    localStorage.setItem('demo-role', role);
    const target = roleToRoute[role] || '/';
    navigate(target, { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Always bypass when using demo credentials (no Supabase needed)
      if (email === DEMO.email && password === DEMO.password) {
        toast({ title: 'Demo login (bypass)', description: 'Direct access with demo credentials.' });
        // Set demo session so RoleRoute permits protected routes
        localStorage.setItem('demo-auth', 'true');
        localStorage.setItem('demo-email', DEMO.email);
        localStorage.setItem('demo-role', role);
        // Prefer `next` query param for destination
        const target = roleToRoute[role] || '/';
        navigateToNextOr(target);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful!",
        description: "Welcome back to HealthAI.",
      });

      // After real login, prefer `next` if present; else by role
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const uRole = (user?.user_metadata?.role as Role) || role;
      const fallback = roleToRoute[uRole] || '/';
      navigateToNextOr(fallback);
    } catch (error: any) {
      // If email is not confirmed, auto-resend the verification email
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('confirm') || error?.status === 400) {
        try {
          await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: `${window.location.origin}/` },
          });
          toast({
            title: 'Email not confirmed',
            description: `We sent a new verification link to ${email}. Please confirm and try again.`,
          });
        } catch (resendErr: any) {
          toast({
            title: 'Login failed',
            description: resendErr?.message || 'Email not confirmed. Please check your inbox.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: "Login failed",
        description: error?.message || 'Unable to sign in.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (email !== DEMO.email || password !== DEMO.password) {
      setEmail(DEMO.email);
      setPassword(DEMO.password);
    }
    setIsLoading(true);
    try {
      // Always bypass Supabase for the Demo Account for instant access
      toast({ title: 'Logged in as Demo (bypass)', description: 'Demo mode: direct navigation without Supabase.' });
      // Set demo session so RoleRoute permits protected routes
      localStorage.setItem('demo-auth', 'true');
      localStorage.setItem('demo-email', DEMO.email);
      localStorage.setItem('demo-role', role);
      const target = roleToRoute[role] || '/';
      navigateToNextOr(target);
    } catch (error: any) {
      toast({
        title: 'Demo login failed',
        description: error?.message || 'Unexpected error during demo navigation.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast({ title: 'Verification sent', description: `Check ${email} for the confirmation link.` });
    } catch (error: any) {
      toast({ title: 'Could not send verification', description: error?.message || 'Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      // In demo mode, skip calling Supabase and just inform user
      if (DEMO_MODE) {
        toast({ title: 'Demo mode active', description: 'Sign up is disabled in demo mode. Use demo credentials.' });
        setActiveTab('login');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { role },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      // Switch to login tab so user can log in after verifying
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error?.message || 'Unable to create account.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">HealthAI</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to HealthAI</CardTitle>
            <CardDescription>
              Access your healthcare portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
                    {isLoading ? 'Please wait...' : 'Login with Demo Account'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-xs text-muted-foreground hover:underline"
                      disabled={isLoading}
                    >
                      Resend verification email
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role</Label>
                    <select
                      id="signup-role"
                      className="w-full border rounded-md p-2 bg-background"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="patient">Patient</option>
                      <option value="admin">Hospital Admin</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground text-center">
                Email: demo@healthai.com<br />
                Password: demo123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;