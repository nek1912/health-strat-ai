import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  Settings,
  Users,
  ShieldCheck,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fnAnalytics, fnGetAssignedPatients, fnGetAppointments, fnTriggerPrediction, fnUpdateAppointment } from "@/integrations/supabase/functions";
import { toast } from "@/components/ui/sonner";

// Backend-aligned shapes (minimal fields used by UI)
type Risk = "low" | "medium" | "high";
interface PatientRow {
  id: string;
  name?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  date_of_birth?: string | null;
  last_visit_at?: string | null;
  risk?: Risk | null;
}

interface AppointmentRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string; // ISO
  reason?: string | null;
  status: string; // scheduled | completed | canceled
}

const RISK_COLORS: Record<Risk, string> = {
  low: "#16a34a",
  medium: "#f59e0b",
  high: "#dc2626",
};

const mockAlerts = [
  { id: "AL1", message: "New prediction available", severity: "info", createdAt: new Date().toISOString() },
];

const RiskPill: React.FC<{ risk: Risk }> = ({ risk }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
      (risk === "high"
        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        : risk === "medium"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400")
    }
  >
    {risk.toUpperCase()}
  </span>
);

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState<boolean>(document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const root = document.documentElement;
    if (dark) root.classList.remove("dark");
    else root.classList.add("dark");
    setDark(!dark);
  };
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

const NavbarBar: React.FC<{ onSearch: (q: string) => void; notifications: number }> = ({ onSearch, notifications }) => (
  <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-sky-600 to-teal-500 p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-sky-600 to-teal-500 bg-clip-text text-transparent">MediSense</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input onChange={(e) => onSearch(e.target.value)} placeholder="Search patients by name, ID, or condition" className="pl-9" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-4 min-w-4 px-1">
                {notifications}
              </span>
            )}
          </Button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="hidden md:inline-flex">Dr. Jane Doe</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Doctor Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start">Profile</Button>
                <Button variant="ghost" className="w-full justify-start">Settings</Button>
                <Button variant="destructive" className="w-full justify-start">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </div>
);

const Sidebar: React.FC<{ collapsed: boolean; setCollapsed: (v: boolean) => void; activeId: string; onNavigate: (id: string) => void }> = ({ collapsed, setCollapsed, activeId, onNavigate }) => (
  <aside className={(collapsed ? "w-16 " : "w-64 ") + "transition-all duration-200 border-r bg-background h-[calc(100vh-4rem)] sticky top-16"}>
    <div className="p-2 flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </div>
    <nav className="px-2 space-y-1">
      {[
        { label: "Overview", icon: LayoutGrid, id: "overview" },
        { label: "Patients", icon: Users, id: "patients" },
        { label: "Risk Predictions", icon: HeartPulse, id: "risk" },
        { label: "Reports", icon: ListChecks, id: "reports" },
        { label: "Appointments", icon: CalendarDays, id: "appointments" },
      ].map(({ label, icon: Icon, id }) => (
        <button key={label} onClick={() => onNavigate(id)} className={(activeId === id ? "bg-muted " : "") + "w-full text-left group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"}>
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          {!collapsed && <span>{label}</span>}
        </button>
      ))}
    </nav>
  </aside>
);

const StatsGrid: React.FC<{ stats: { totalPatients: number; highRisk: number; upcoming: number; notifications: number } }> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalPatients}</div>
        <p className="text-xs text-muted-foreground">+12% from last month</p>
      </CardContent>
    </Card>
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">High-Risk Patients</CardTitle>
        <ShieldCheck className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
        <p className="text-xs text-muted-foreground">Requires attention</p>
      </CardContent>
    </Card>
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.upcoming}</div>
        <p className="text-xs text-muted-foreground">Today & tomorrow</p>
      </CardContent>
    </Card>
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.notifications}</div>
        <p className="text-xs text-muted-foreground">Real-time updates</p>
      </CardContent>
    </Card>
  </div>
);

const RiskChart: React.FC<{ distribution: { low: number; medium: number; high: number } }> = ({ distribution }) => {
  const data = useMemo(() => ([
    { name: "Low", value: distribution.low, color: RISK_COLORS.low },
    { name: "Medium", value: distribution.medium, color: RISK_COLORS.medium },
    { name: "High", value: distribution.high, color: RISK_COLORS.high },
  ]), [distribution]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Risk Overview</CardTitle>
        <CardDescription>Distribution of patients by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientTable: React.FC<{ patients: PatientRow[]; onView: (p: PatientRow) => void; query: string; onQuery: (q: string) => void; riskFilter: Risk | "all"; onRisk: (r: Risk | "all") => void; onPredict: (p: PatientRow) => void; loading?: boolean; }> = ({ patients, onView, query, onQuery, riskFilter, onRisk, onPredict, loading }) => {
  const visible = patients.filter((p) => {
    const q = (query || "").toLowerCase();
    const matchesQuery = !q || [p.name || "", p.id || "", p.blood_group || ""].some(v => v.toLowerCase().includes(q));
    const matchesRisk = riskFilter === "all" || (p.risk || "low") === riskFilter;
    return matchesQuery && matchesRisk;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
        <CardDescription>Paginated, searchable list of patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search by name, ID, or condition" className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            {["all", "low", "medium", "high"].map((r) => (
              <Button key={r} variant={riskFilter === r ? "default" : "outline"} size="sm" onClick={() => onRisk(r as any)}>
                {r === "all" ? "All" : (r as string).toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : visible.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No patients found</TableCell></TableRow>
              ) : visible.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name || p.id}</TableCell>
                  <TableCell>{p.gender || '-'}</TableCell>
                  <TableCell>{p.blood_group || '-'}</TableCell>
                  <TableCell>{p.last_visit_at ? new Date(p.last_visit_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{p.risk ? <RiskPill risk={p.risk as Risk} /> : '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onView(p)}>View</Button>
                      <Button size="sm" onClick={() => onPredict(p)}>Predict</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientModal: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; patient?: PatientRow; lastPred?: any }> = ({ open, onOpenChange, patient, lastPred }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>Patient Profile</SheetTitle>
      </SheetHeader>
      {patient ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold">{patient.name || patient.id}</p>
              <p className="text-sm text-muted-foreground">ID {patient.id} • {patient.gender || '—'}</p>
            </div>
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Blood group: {patient.blood_group || '—'}</p>
                  <p>Last visit: {patient.last_visit_at ? new Date(patient.last_visit_at).toLocaleString() : '—'}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>History view can be wired to your existing endpoints.</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {lastPred && (!patient || !lastPred?.explanation?.patient_id || lastPred.explanation.patient_id === patient.id) ? (
                    <div className="space-y-2">
                      {typeof lastPred.risk_score === 'number' && (
                        <p><span className="font-medium">Readmission risk:</span> {Math.round(lastPred.risk_score * 100)}%</p>
                      )}
                      {Array.isArray(lastPred?.high_risk_conditions) && lastPred.high_risk_conditions.length > 0 && (
                        <p><span className="font-medium">Top drivers:</span> {lastPred.high_risk_conditions.join(', ')}</p>
                      )}
                      {Array.isArray(lastPred?.explanation?.readmission?.top_features) && (
                        <div>
                          <p className="font-medium mb-1">Readmission factors:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {lastPred.explanation.readmission.top_features.slice(0,5).map((t: string, i: number) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(lastPred?.explanation?.severity?.top_features) && (
                        <div>
                          <p className="font-medium mb-1">Severity factors:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {lastPred.explanation.severity.top_features.slice(0,5).map((t: string, i: number) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Run prediction from table actions to fetch latest AI insight.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">Select a patient to view details.</p>
      )}
    </SheetContent>
  </Sheet>
);

const AppointmentsCard: React.FC<{ items: Array<{ id: string; patientName: string; time: string; status: string }>; onConfirm: (id: string) => void; onResched: (id: string) => void; loading?: boolean; pendingId?: string | null }> = ({ items, onConfirm, onResched, loading, pendingId }) => (
  <Card>
    <CardHeader>
      <CardTitle>Upcoming Appointments</CardTitle>
      <CardDescription>Quick actions to confirm or reschedule</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {loading && items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming appointments</div>
        ) : items.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 justify-between p-3 rounded-lg bg-muted/50">
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[12rem] sm:max-w-[16rem]">{a.patientName}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
            </div>
            <Badge className="shrink-0" variant={a.status === "completed" ? "default" : "secondary"}>{a.status}</Badge>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" disabled={pendingId === a.id} onClick={() => onConfirm(a.id)}>
                {pendingId === a.id ? 'Confirming...' : 'Confirm'}
              </Button>
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white whitespace-nowrap" disabled={pendingId === a.id} onClick={() => onResched(a.id)}>
                {pendingId === a.id ? 'Rescheduling...' : 'Reschedule'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AlertsPanel: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>AI Alerts</CardTitle>
      <CardDescription>Latest predictions and recommendations</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {mockAlerts.map((al) => (
          <div key={al.id} className="p-3 rounded-lg border flex items-start gap-3">
            <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm">{al.message}</p>
              <p className="text-xs text-muted-foreground">{new Date(al.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const FooterBar: React.FC = () => (
  <footer className="mt-10 py-6 border-t text-xs text-muted-foreground flex items-center justify-between">
    <span> 2025 MediSense Hospital</span>
    <div className="flex items-center gap-4">
      <a className="hover:underline" href="#">Privacy Policy</a>
      <a className="hover:underline" href="#">Contact</a>
    </div>
  </footer>
);

const DoctorDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<Risk | "all">("all");
  const [selected, setSelected] = useState<PatientRow | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastPred, setLastPred] = useState<any | null>(null);
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedId, setReschedId] = useState<string | null>(null);
  const [reschedDate, setReschedDate] = useState<Date | undefined>(new Date());
  const [reschedTime, setReschedTime] = useState<string>("09:00");
  const queryClient = useQueryClient();

  // Patients list
  const { data: patientsResp, isLoading: patientsLoading, refetch: refetchPatients } = useQuery({
    queryKey: ["assignedPatients", search],
    queryFn: () => fnGetAssignedPatients({ search: search || undefined, limit: 50, offset: 0 })
  });
  const demoPatients: PatientRow[] = [
    { id: "P-1001", name: "John Smith", gender: "Male", blood_group: "O+", last_visit_at: new Date().toISOString(), risk: "high" },
    { id: "P-1002", name: "Sarah Johnson", gender: "Female", blood_group: "A-", last_visit_at: new Date(Date.now()-86400000*3).toISOString(), risk: "medium" },
    { id: "P-1003", name: "Emily Davis", gender: "Female", blood_group: "B+", last_visit_at: new Date(Date.now()-86400000*10).toISOString(), risk: "low" },
    { id: "P-1004", name: "Mike Wilson", gender: "Male", blood_group: "AB+", last_visit_at: new Date(Date.now()-86400000*30).toISOString(), risk: "medium" },
  ];
  const patientsRaw: PatientRow[] = (patientsResp?.data as PatientRow[]) || [];
  const patients: PatientRow[] = patientsRaw.length > 0 ? patientsRaw : demoPatients;

  // Analytics
  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fnAnalytics({})
  });

  // Appointments
  const { data: apptsResp, isLoading: apptsLoading, refetch: refetchAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fnGetAppointments({ status: "scheduled", limit: 10, offset: 0 }),
    staleTime: 60_000, // 1 min: avoid frequent refetches
    gcTime: 300_000,   // keep cached data for 5 min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
  const apptFromApi: Array<{ id: string; patientName: string; time: string; status: string }> = ((apptsResp?.data as AppointmentRow[]) || []).map(a => ({
    id: a.id,
    patientName: a.patient_id, // could be joined in future
    time: a.scheduled_at,
    status: a.status,
  }));
  const demoAppts: Array<{ id: string; patientName: string; time: string; status: string }> = [
    { id: "A-2001", patientName: "John Smith", time: new Date(Date.now()+3600000).toISOString(), status: "scheduled" },
    { id: "A-2002", patientName: "Emily Davis", time: new Date(Date.now()+7200000).toISOString(), status: "scheduled" },
  ];
  const apptItems = apptFromApi.length > 0 ? apptFromApi : demoAppts;
  const usingDemoAppts = apptFromApi.length === 0;

  const derivedRisk = patients.reduce((acc, p) => { if (p.risk) acc[p.risk] += 1; return acc; }, { low: 0, medium: 0, high: 0 });
  const stats = {
    totalPatients: analytics?.totals?.patients ?? patients.length,
    highRisk: analytics?.risk_distribution?.high ?? derivedRisk.high,
    upcoming: analytics?.totals?.appointments_pending ?? apptItems.length,
    notifications: mockAlerts.length,
  };

  const handleView = (p: PatientRow) => {
    setSelected(p);
    setModalOpen(true);
  };

  const [pendingId, setPendingId] = useState<string | null>(null);
  const predictMutation = useMutation({
    mutationFn: (patient_id: string) => fnTriggerPrediction(patient_id),
    onSuccess: (data: any) => {
      setLastPred(data);
      const pct = typeof data?.risk_score === 'number' ? Math.round(data.risk_score * 100) : undefined;
      toast("Prediction complete", {
        description: pct !== undefined ? `Readmission risk: ${pct}%` : "Received ML insight.",
      });
      // Optionally open the AI tab for the selected patient
      if (selected && (data?.explanation?.patient_id ? selected.id === data.explanation.patient_id : true)) {
        setModalOpen(true);
      }
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (e: any) => toast("Prediction failed", { description: String(e?.message || e) })
  });

  const updateAppt = useMutation({
    mutationFn: (vars: { id: string; status?: string }) => fnUpdateAppointment(vars),
    onSuccess: () => { refetchAppts(); toast("Appointment updated"); },
    onError: (e: any) => toast("Update failed", { description: String(e?.message || e) }),
    onSettled: () => setPendingId(null),
  });

  const confirmAppt = (id: string) => {
    if (usingDemoAppts) {
      toast("Appointment confirmed (demo)");
      toast("Doctor notified (demo)", { description: "A task has been assigned to follow-up." });
      return;
    }
    setPendingId(id);
    updateAppt.mutate({ id, status: "completed" });
    toast("Doctor notified", { description: "A follow-up task has been assigned." });
  };

  const openReschedule = (id: string) => {
    setReschedId(id);
    setReschedOpen(true);
  };

  const submitReschedule = () => {
    if (!reschedId || !reschedDate || !reschedTime) return;
    const [hh, mm] = reschedTime.split(":").map(Number);
    const d = new Date(reschedDate);
    d.setHours(hh || 0, mm || 0, 0, 0);
    const iso = d.toISOString();

    if (usingDemoAppts) {
      toast("Rescheduled (demo)", { description: new Date(iso).toLocaleString() });
      setReschedOpen(false);
      setReschedId(null);
      return;
    }
    setPendingId(reschedId);
    updateAppt.mutate({ id: reschedId, status: "scheduled", ...( { scheduled_at: iso } as any) });
    setReschedOpen(false);
    setReschedId(null);
  };

  const onPredict = (p: PatientRow) => predictMutation.mutate(p.id);

  const [activeSection, setActiveSection] = useState("overview");
  const navLockUntil = useRef<number | null>(null);

  // Scroll spy: keep sidebar highlight in sync with right-side sections
  useEffect(() => {
    const ids = ["overview", "risk", "appointments", "patients", "reports"];
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer while a manual navigation is in progress
        if (navLockUntil.current && Date.now() < navLockUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top); // closest to top wins
        if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavbarBar onSearch={setSearch} notifications={stats.notifications} />
      <div className="flex">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeId={activeSection}
          onNavigate={(id) => {
            setActiveSection(id);
            // Lock observer for a short period so the highlight doesn't jump
            navLockUntil.current = Date.now() + 800;
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Safety unlock in case of short pages
            window.setTimeout(() => { navLockUntil.current = null; }, 900);
          }}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Welcome Banner */}
          <div id="overview" className="scroll-mt-20"></div>
          <Card className="mb-6">
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Welcome back, Dr. Jane Doe</h2>
                <p className="text-sm text-muted-foreground">Here are today’s patient insights and actions</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Link to="/"><Button variant="outline" className="gap-2"><Home className="h-4 w-4" /> Home</Button></Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <StatsGrid stats={stats} />

          {/* Charts + Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div id="risk" className="scroll-mt-24"></div>
              <RiskChart distribution={{
                low: analytics?.risk_distribution?.low ?? derivedRisk.low,
                medium: analytics?.risk_distribution?.medium ?? derivedRisk.medium,
                high: analytics?.risk_distribution?.high ?? derivedRisk.high,
              }} />
            </div>
            <div id="appointments" className="scroll-mt-24">
              <AppointmentsCard items={apptItems} onConfirm={confirmAppt} onResched={openReschedule} loading={apptsLoading && apptFromApi.length === 0} pendingId={pendingId} />
            </div>
          </div>

          {/* Patients + Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div id="patients" className="scroll-mt-24"></div>
              <PatientTable
                patients={patients}
                onView={handleView}
                onPredict={onPredict}
                loading={patientsLoading && patients.length === 0}
                query={search}
                onQuery={(q) => { setSearch(q); refetchPatients(); }}
                riskFilter={risk}
                onRisk={setRisk}
              />
            </div>
            <div id="reports" className="scroll-mt-24">
              <AlertsPanel />
            </div>
          </div>

          <FooterBar />
        </main>
      </div>

      <PatientModal open={modalOpen} onOpenChange={setModalOpen} patient={selected} lastPred={lastPred} />

      {/* Reschedule Dialog */}
      <Dialog open={reschedOpen} onOpenChange={setReschedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Pick a date</Label>
              <Calendar mode="single" selected={reschedDate} onSelect={setReschedDate} className="rounded-md border" />
            </div>
            <div>
              <Label htmlFor="resched-time" className="mb-2 block">Time</Label>
              <Input id="resched-time" type="time" value={reschedTime} onChange={(e) => setReschedTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedOpen(false)}>Cancel</Button>
            <Button onClick={submitReschedule} className="bg-sky-600 hover:bg-sky-700 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
