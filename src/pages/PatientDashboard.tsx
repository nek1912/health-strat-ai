import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Activity, Bell, ChevronLeft, ChevronRight, HeartPulse, MessageSquareText, CalendarDays, FileDown, Stethoscope, Pill, Search } from "lucide-react";

// Mock patient and data
const patientName = "John Doe";
const healthScore = 82; // 0-100
const overviewStats = [
  { label: "Risk Level", value: "Medium", color: "bg-amber-500" },
  { label: "Last Checkup", value: "2025-07-21", color: "bg-slate-500" },
  { label: "Appointments", value: "5", color: "bg-indigo-500" },
  { label: "Active Prescriptions", value: "3", color: "bg-emerald-500" },
];

const vitalsTrend = [
  { date: "Jun", bp: 128, hr: 76, glucose: 103 },
  { date: "Jul", bp: 124, hr: 74, glucose: 100 },
  { date: "Aug", bp: 130, hr: 79, glucose: 108 },
  { date: "Sep", bp: 126, hr: 72, glucose: 101 },
];

const recommendations = [
  { id: 1, tip: "Schedule fasting blood test next week.", type: "Reminder" },
  { id: 2, tip: "Increase daily step count to 8,000.", type: "Lifestyle" },
  { id: 3, tip: "Reduce sodium intake for improved BP.", type: "Diet" },
];

const upcoming = [
  { id: "A-101", when: "2025-09-02 09:30", with: "Dr. Alice Carter", dept: "Cardiology", status: "Confirmed" },
  { id: "A-102", when: "2025-09-15 14:00", with: "Dr. Brian Lee", dept: "Endocrinology", status: "Pending" },
];
const past = [
  { id: "A-090", when: "2025-07-21 11:00", with: "Dr. Alice Carter", dept: "Cardiology" },
  { id: "A-083", when: "2025-06-05 10:00", with: "Dr. Chen Wu", dept: "Pulmonology" },
];

const messages = [
  { id: "M-1", from: "Dr. Carter", preview: "Please monitor BP at home...", time: "2h ago", unread: true },
  { id: "M-2", from: "Dr. Lee", preview: "Your last A1C looks improved.", time: "1d ago", unread: false },
];

const history = [
  { date: "2025-07-21", type: "Consultation", notes: "Cardiology follow-up", file: true },
  { date: "2025-05-13", type: "Lab", notes: "HbA1c 6.4%", file: true },
  { date: "2025-03-01", type: "Imaging", notes: "Chest X-ray normal", file: false },
];

const PatientNavbar: React.FC<{ notifications: number }> = ({ notifications }) => (
  <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">Patient Portal</span>
        </div>
        <div className="hidden md:flex items-center text-sm text-muted-foreground">
          Welcome, <span className="ml-1 font-semibold text-foreground">{patientName}</span>
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
              <Button variant="outline" className="hidden md:inline-flex">{patientName.split(' ')[0]}</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Profile</SheetTitle>
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

const Sidebar: React.FC<{ collapsed: boolean; setCollapsed: (v: boolean) => void }> = ({ collapsed, setCollapsed }) => (
  <aside className={(collapsed ? 'w-16 ' : 'w-64 ') + 'transition-all duration-200 border-r bg-background h-[calc(100vh-4rem)] sticky top-16'}>
    <div className="p-2 flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </div>
    <nav className="px-2 space-y-1">
      {[
        { label: 'Dashboard', icon: HeartPulse, href: '#dashboard' },
        { label: 'My Health Records', icon: FileDown, href: '#records' },
        { label: 'Appointments', icon: CalendarDays, href: '#appointments' },
        { label: 'AI Recommendations', icon: Stethoscope, href: '#recommendations' },
        { label: 'Messages', icon: MessageSquareText, href: '#messages' },
        { label: 'Billing & Reports', icon: FileDown, href: '#billing' },
        { label: 'Settings', icon: Pill, href: '#settings' },
      ].map(({ label, icon: Icon, href }) => (
        <a key={label} href={href} className={'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors'}>
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          {!collapsed && <span>{label}</span>}
        </a>
      ))}
    </nav>
  </aside>
);

const WelcomeAndStats: React.FC = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="py-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Welcome, {patientName}</h2>
          <p className="text-sm text-muted-foreground">Your personalized health overview</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Health Score</p>
          <div className="text-3xl font-bold text-teal-600">{healthScore}</div>
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewStats.map((s) => (
        <Card key={s.label} className="hover:shadow-md transition-all">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{s.label}</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-semibold">{s.value}</div>
            <span className={`inline-block h-2 w-2 rounded-full ${s.color}`} aria-hidden />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const Recommendations: React.FC = () => (
  <section id="recommendations" className="space-y-4">
    <h3 className="text-lg font-semibold">AI Recommendations</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recommendations.map(r => (
        <Card key={r.id} className="hover:shadow-md transition-all">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{r.type}</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{r.tip}</p></CardContent>
        </Card>
      ))}
    </div>
  </section>
);

const HealthChart: React.FC = () => (
  <section className="space-y-4">
    <h3 className="text-lg font-semibold">Health Progress</h3>
    <Card>
      <CardHeader><CardTitle>Vitals Over Time</CardTitle><CardDescription>BP, Heart Rate, Glucose</CardDescription></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vitalsTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line type="monotone" dataKey="bp" stroke="#0ea5e9" strokeWidth={2} name="Blood Pressure" />
            <Line type="monotone" dataKey="hr" stroke="#22c55e" strokeWidth={2} name="Heart Rate" />
            <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} name="Glucose" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </section>
);

const Appointments: React.FC = () => (
  <section id="appointments" className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Appointments</h3>
      <Button className="bg-teal-600 hover:bg-teal-700">Book Appointment</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {upcoming.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>{a.when} • {a.with} ({a.dept})</span>
              <Badge>{a.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Past</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {past.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span>{a.when} • {a.with} ({a.dept})</span>
              <Badge variant="secondary">Completed</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </section>
);

const MessagesPanel: React.FC = () => (
  <section id="messages" className="space-y-4">
    <h3 className="text-lg font-semibold">Messages</h3>
    <Card>
      <CardHeader><CardTitle>Recent Conversations</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id} className={`p-3 rounded-lg border flex items-center justify-between ${m.unread ? 'bg-emerald-50' : ''}`}>
              <div>
                <p className="text-sm font-medium">{m.from}</p>
                <p className="text-xs text-muted-foreground">{m.preview}</p>
              </div>
              <span className="text-xs text-muted-foreground">{m.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </section>
);

const HistoryTable: React.FC = () => (
  <section id="records" className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Medical History</h3>
      <Button variant="outline" className="gap-2"><FileDown className="h-4 w-4" /> Download PDF</Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Attachment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map(r => (
            <TableRow key={r.date+r.type}>
              <TableCell className="font-medium">{r.date}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.notes}</TableCell>
              <TableCell className="text-right">{r.file ? <Button size="sm" variant="outline">View</Button> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </section>
);

const FooterBar: React.FC = () => (
  <footer className="mt-10 py-6 border-t text-xs text-muted-foreground flex items-center justify-between">
    <span>© {new Date().getFullYear()} MediSense Hospital</span>
    <div className="flex items-center gap-4">
      <a className="hover:underline" href="#">Support</a>
      <a className="hover:underline" href="#">Contact</a>
      <a className="hover:underline" href="#">Privacy</a>
    </div>
  </footer>
);

const PatientDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const notifications = messages.filter(m => m.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <PatientNavbar notifications={notifications} />
      <div className="flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          <section id="dashboard" className="space-y-6">
            <WelcomeAndStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HealthChart />
                <Appointments />
              </div>
              <div className="space-y-6">
                <Recommendations />
                <MessagesPanel />
              </div>
            </div>
          </section>

          <HistoryTable />
          <FooterBar />
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
