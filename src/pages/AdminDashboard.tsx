import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileDown,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  UserCog,
  Users,
  Stethoscope,
  BedDouble,
  Cpu,
  TrendingUp,
  Search,
} from "lucide-react";

// Mock types and data
interface Doctor { id: string; name: string; specialty: string; patients: number; available: boolean }
interface Patient { id: string; name: string; condition: string; risk: 'low' | 'medium' | 'high' }

const mockDoctors: Doctor[] = [
  { id: 'D001', name: 'Dr. Alice Carter', specialty: 'Cardiology', patients: 42, available: true },
  { id: 'D002', name: 'Dr. Brian Lee', specialty: 'Endocrinology', patients: 37, available: false },
  { id: 'D003', name: 'Dr. Chen Wu', specialty: 'Pulmonology', patients: 28, available: true },
];

const mockPatients: Patient[] = [
  { id: 'P001', name: 'John Smith', condition: 'Hypertension', risk: 'high' },
  { id: 'P002', name: 'Sarah Johnson', condition: 'Diabetes', risk: 'medium' },
  { id: 'P003', name: 'Emily Davis', condition: 'Asthma', risk: 'low' },
  { id: 'P004', name: 'Mike Wilson', condition: 'COPD', risk: 'high' },
];

const patientGrowth = [
  { month: 'Jan', patients: 140 },
  { month: 'Feb', patients: 156 },
  { month: 'Mar', patients: 171 },
  { month: 'Apr', patients: 188 },
  { month: 'May', patients: 203 },
  { month: 'Jun', patients: 219 },
];

const doctorWorkload = [
  { name: 'Cardiology', count: 120 },
  { name: 'Endocrinology', count: 98 },
  { name: 'Pulmonology', count: 86 },
  { name: 'Neurology', count: 76 },
  { name: 'Orthopedics', count: 69 },
];

const riskSummaryPie = [
  { name: 'Low', value: 45, color: '#16a34a' },
  { name: 'Medium', value: 28, color: '#f59e0b' },
  { name: 'High', value: 17, color: '#dc2626' },
];

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, anchor: '#dashboard' },
  { label: 'Manage Doctors', icon: Stethoscope, anchor: '#doctors' },
  { label: 'Manage Patients', icon: Users, anchor: '#patients' },
  { label: 'Appointments', icon: CalendarDays, anchor: '#appointments' },
  { label: 'Resources', icon: BedDouble, anchor: '#resources' },
  { label: 'AI Analytics', icon: Cpu, anchor: '#analytics' },
  { label: 'Reports', icon: ListChecks, anchor: '#reports' },
  { label: 'Settings', icon: Settings, anchor: '#settings' },
];

const NavbarBar: React.FC<{ onSearch: (q: string) => void; notifications: number }> = ({ onSearch, notifications }) => (
  <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Hospital Admin</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input onChange={(e) => onSearch(e.target.value)} placeholder="Search patients, doctors, records" className="pl-9" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] h-4 min-w-4 px-1">{notifications}</span>
            )}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="hidden md:inline-flex">Admin</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Admin Menu</SheetTitle>
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

const Sidebar: React.FC<{ collapsed: boolean; setCollapsed: (v: boolean) => void; active: string }> = ({ collapsed, setCollapsed, active }) => (
  <aside className={(collapsed ? 'w-16 ' : 'w-64 ') + 'transition-all duration-200 border-r bg-background h-[calc(100vh-4rem)] sticky top-16'}>
    <div className="p-2 flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </div>
    <nav className="px-2 space-y-1">
      {navItems.map(({ label, icon: Icon, anchor }) => (
        <a key={label} href={anchor} className={(active === label ? 'bg-muted ' : '') + 'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors'}>
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          {!collapsed && <span>{label}</span>}
        </a>
      ))}
    </nav>
  </aside>
);

const StatsGrid: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card className="hover:shadow-lg transition-all"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Doctors</CardTitle><Stethoscope className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">54</div><p className="text-xs text-muted-foreground">+3 this month</p></CardContent></Card>
    <Card className="hover:shadow-lg transition-all"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Patients</CardTitle><Users className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">1,284</div><p className="text-xs text-muted-foreground">+76 this month</p></CardContent></Card>
    <Card className="hover:shadow-lg transition-all"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Appointments</CardTitle><CalendarDays className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">312</div><p className="text-xs text-muted-foreground">This week</p></CardContent></Card>
    <Card className="hover:shadow-lg transition-all"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Occupancy</CardTitle><BedDouble className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">78%</div><p className="text-xs text-muted-foreground">ICU 65%</p></CardContent></Card>
  </div>
);

const OverviewCharts: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Patient Growth</CardTitle><CardDescription>Monthly new patients</CardDescription></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={patientGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Line type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Doctor Workload</CardTitle><CardDescription>Patients per specialty</CardDescription></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={doctorWorkload}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

const AISummary: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card>
      <CardHeader><CardTitle>AI Risk Summary</CardTitle><CardDescription>Patients by risk level</CardDescription></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={riskSummaryPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
              {riskSummaryPie.map((e, i) => (<Cell key={i} fill={e.color} />))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle>Notifications & Alerts</CardTitle><CardDescription>AI-driven insights</CardDescription></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[{msg:'Rising hypertension risk in 45-60 age group', t:'Just now'}, {msg:'ICU occupancy forecast to reach 85% next week', t:'2h ago'}, {msg:'Increase in pulmonary cases this month', t:'1d ago'}].map((a, idx) => (
            <div key={idx} className="p-3 rounded-lg border flex items-start gap-3">
              <TrendingUp className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm">{a.msg}</p>
                <p className="text-xs text-muted-foreground">{a.t}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Doctor>({ id: '', name: '', specialty: '', patients: 0, available: true });

  const filtered = useMemo(() => doctors.filter(d => [d.name, d.specialty, d.id].some(v => v.toLowerCase().includes(query.toLowerCase()))), [doctors, query]);

  const save = () => {
    if (!form.name || !form.specialty) return;
    setDoctors(prev => {
      const exists = prev.some(d => d.id === form.id);
      return exists ? prev.map(d => d.id === form.id ? form : d) : [...prev, { ...form, id: form.id || `D${Math.floor(Math.random()*900+100)}` }];
    });
    setOpen(false); setEditing(null); setForm({ id: '', name: '', specialty: '', patients: 0, available: true });
  };
  const edit = (d: Doctor) => { setEditing(d); setForm(d); setOpen(true); };
  const remove = (id: string) => setDoctors(prev => prev.filter(d => d.id !== id));

  return (
    <section id="doctors" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Doctors</h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Search doctors" value={query} onChange={e=>setQuery(e.target.value)} className="w-56" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm({ id: '', name: '', specialty: '', patients: 0, available: true }); }}>Add Doctor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                <Input placeholder="Specialty" value={form.specialty} onChange={e=>setForm({...form, specialty: e.target.value})} />
                <Input placeholder="Patients Assigned" type="number" value={form.patients} onChange={e=>setForm({...form, patients: Number(e.target.value)})} />
                <div className="flex items-center gap-2 text-sm"><input id="avail" type="checkbox" checked={form.available} onChange={e=>setForm({...form, available: e.target.checked})} /><label htmlFor="avail">Available</label></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editing ? 'Save Changes' : 'Add Doctor'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Patients</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.specialty}</TableCell>
                <TableCell>{d.patients}</TableCell>
                <TableCell>{d.available ? <Badge>Available</Badge> : <Badge variant="secondary">Busy</Badge>}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={()=>edit(d)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={()=>remove(d.id)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => patients.filter(p => [p.name, p.condition, p.id].some(v => v.toLowerCase().includes(query.toLowerCase()))), [patients, query]);
  const toggleFlag = (id: string) => setPatients(prev => prev.map(p => p.id === id ? { ...p, risk: p.risk === 'high' ? 'medium' : 'high' } : p));

  return (
    <section id="patients" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Patients</h3>
        <Input placeholder="Search patients" value={query} onChange={e=>setQuery(e.target.value)} className="w-56" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.condition}</TableCell>
                <TableCell>
                  <Badge variant={p.risk === 'high' ? 'destructive' : p.risk === 'medium' ? 'secondary' : 'default'}>{p.risk.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={()=>toggleFlag(p.id)}>{p.risk === 'high' ? 'Unflag' : 'Flag High Risk'}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

const AppointmentsOverview: React.FC = () => (
  <section id="appointments" className="space-y-4">
    <h3 className="text-lg font-semibold">Appointments Overview</h3>
    <Card>
      <CardHeader><CardTitle>Calendar (Simplified)</CardTitle><CardDescription>Upcoming appointments</CardDescription></CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>2025-08-30 09:30 • Sarah Johnson (Endocrinology)</span><Badge>Confirmed</Badge></div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>2025-08-30 11:00 • Emily Davis (Pulmonology)</span><Badge variant="secondary">Pending</Badge></div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>2025-08-30 14:00 • John Smith (Cardiology)</span><Badge>Confirmed</Badge></div>
        </div>
      </CardContent>
    </Card>
  </section>
);

const ResourcesPanel: React.FC = () => (
  <section id="resources" className="space-y-4">
    <h3 className="text-lg font-semibold">Hospital Resources</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card><CardHeader><CardTitle>Beds</CardTitle><CardDescription>Available / Total</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">142 / 180</div></CardContent></Card>
      <Card><CardHeader><CardTitle>ICU</CardTitle><CardDescription>Available / Total</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">18 / 28</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Ventilators</CardTitle><CardDescription>Available / Total</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">24 / 40</div></CardContent></Card>
    </div>
  </section>
);

const AnalyticsPanel: React.FC = () => (
  <section id="analytics" className="space-y-4">
    <h3 className="text-lg font-semibold">AI Analytics</h3>
    <AISummary />
  </section>
);

const ReportsPanel: React.FC = () => {
  const exportCsv = () => {
    const headers = ['Doctor ID','Name','Specialty','Patients','Available'];
    const rows = mockDoctors.map(d => [d.id, d.name, d.specialty, String(d.patients), d.available ? 'Yes' : 'No']);
    const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'doctors_report.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <section id="reports" className="space-y-4">
      <h3 className="text-lg font-semibold">Billing & Reports</h3>
      <Card>
        <CardHeader><CardTitle>Generate Reports</CardTitle><CardDescription>Export data as CSV</CardDescription></CardHeader>
        <CardContent>
          <Button className="gap-2" onClick={exportCsv}><FileDown className="h-4 w-4" /> Export Doctors CSV</Button>
        </CardContent>
      </Card>
    </section>
  );
};

const FooterBar: React.FC = () => (
  <footer className="mt-10 py-6 border-t text-xs text-muted-foreground flex items-center justify-between">
    <span>© {new Date().getFullYear()} MediSense Hospital</span>
    <div className="flex items-center gap-4">
      <a className="hover:underline" href="#">Privacy Policy</a>
      <a className="hover:underline" href="#">Terms</a>
    </div>
  </footer>
);

const AdminDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState('Dashboard');

  const notifications = 4;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavbarBar onSearch={setSearch} notifications={notifications} />
      <div className="flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Overview */}
          <section id="dashboard" className="space-y-6">
            <Card className="mb-2">
              <CardContent className="py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Hospital Overview</h2>
                  <p className="text-sm text-muted-foreground">Control center for doctors, patients, resources, and AI analytics</p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <Button variant="outline" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</Button>
                  <Link to="/doctor"><Button className="gap-2"><UserCog className="h-4 w-4" /> Doctor View</Button></Link>
                </div>
              </CardContent>
            </Card>
            <StatsGrid />
            <OverviewCharts />
          </section>

          <DoctorManagement />
          <PatientManagement />
          <AppointmentsOverview />
          <ResourcesPanel />
          <AnalyticsPanel />
          <ReportsPanel />

          <FooterBar />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
