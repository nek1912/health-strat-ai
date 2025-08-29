import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Activity, LogOut, Users, Heart, TrendingUp, Bell } from 'lucide-react';

interface DashboardProps {
  userEmail: string;
}

const Dashboard = ({ userEmail }: DashboardProps) => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const mockData = {
    patients: 247,
    activeAlerts: 12,
    avgRiskScore: 3.2,
    todayAppointments: 18
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 p-4">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">HealthAI Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {userEmail}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.patients}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{mockData.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.avgRiskScore}</div>
              <p className="text-xs text-muted-foreground">Low risk overall</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">5 completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Latest patient registrations and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', id: 'P001', status: 'High Risk', time: '2 hours ago' },
                  { name: 'Sarah Johnson', id: 'P002', status: 'Low Risk', time: '4 hours ago' },
                  { name: 'Mike Wilson', id: 'P003', status: 'Medium Risk', time: '6 hours ago' },
                ].map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        patient.status === 'High Risk' ? 'text-red-600' :
                        patient.status === 'Medium Risk' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {patient.status}
                      </p>
                      <p className="text-xs text-muted-foreground">{patient.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>Recent risk assessments and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { patient: 'John Smith', prediction: 'High cardiovascular risk', confidence: '94%' },
                  { patient: 'Sarah Johnson', prediction: 'Diabetes risk detected', confidence: '78%' },
                  { patient: 'Mike Wilson', prediction: 'Medication adjustment needed', confidence: '89%' },
                ].map((prediction, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{prediction.patient}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {prediction.confidence}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{prediction.prediction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;