import React from 'react';
import { 
  Stethoscope, 
  Building2, 
  User, 
  ArrowRight,
  CheckCircle,
  Activity,
  Users,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RoleAccess = () => {
  const roles = [
    {
      title: 'Doctor Portal',
      icon: Stethoscope,
      description: 'Access patient data, AI predictions, and clinical decision support tools.',
      features: [
        'Patient management dashboard',
        'AI-powered risk assessments', 
        'Treatment recommendations',
        'Real-time alerts & notifications'
      ],
      route: '/doctor-login',
      color: 'from-blue-600 to-blue-700',
      accent: 'text-blue-600',
      bgAccent: 'bg-blue-50'
    },
    {
      title: 'Hospital Admin',
      icon: Building2,
      description: 'Manage hospital operations, resources, and staff with comprehensive analytics.',
      features: [
        'Hospital-wide analytics',
        'Resource allocation tracking',
        'Staff management tools',
        'Operational efficiency metrics'
      ],
      route: '/admin-login',
      color: 'from-primary to-primary-dark',
      accent: 'text-primary',
      bgAccent: 'bg-primary/10'
    },
    {
      title: 'Patient Access',
      icon: User,
      description: 'View your health data, medication schedules, and communicate with your care team.',
      features: [
        'Personal health dashboard',
        'Medication reminders',
        'Appointment scheduling',
        'Secure messaging with doctors'
      ],
      route: '/patient-login',
      color: 'from-secondary to-secondary-light',
      accent: 'text-secondary',
      bgAccent: 'bg-secondary/10'
    }
  ];

  const handleRoleAccess = (route: string) => {
    // Navigate to auth page
    window.location.href = '/auth';
  };

  return (
    <section id="roles" className="section-padding">
      <div className="container-custom">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold">
            <Users className="h-4 w-4" />
            <span>Role-Based Access</span>
          </div>
          <h2 className="heading-secondary text-center">
            Choose your
            <span className="text-gradient"> healthcare role</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access tailored dashboards and tools designed specifically for your role in healthcare delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div 
              key={index}
              className="group relative bg-card rounded-3xl p-8 shadow-soft hover:shadow-large transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 border border-border/50"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className={`bg-gradient-to-r ${role.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="heading-tertiary group-hover:text-primary transition-colors">
                  {role.title}
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {role.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className={`h-4 w-4 ${role.accent} flex-shrink-0`} />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                onClick={() => handleRoleAccess(role.route)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold transition-all duration-300"
              >
                Access Portal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Decorative Elements */}
              <div className={`absolute top-4 right-4 w-20 h-20 ${role.bgAccent} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              <div className={`absolute bottom-4 left-4 w-12 h-12 ${role.bgAccent} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 bg-muted/50 rounded-2xl px-8 py-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">500+ Hospitals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">1M+ Patients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleAccess;