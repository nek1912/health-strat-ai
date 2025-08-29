import React from 'react';
import { 
  Brain, 
  Activity, 
  BarChart3, 
  Heart, 
  Shield, 
  Zap,
  Users,
  TrendingUp,
  Clock,
  Award,
  Database,
  Stethoscope
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Risk Predictions',
      description: 'Advanced machine learning algorithms analyze patient data to predict health risks and outcomes with 95% accuracy.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Activity,
      title: 'Doctor Dashboard',
      description: 'Comprehensive dashboard for healthcare professionals with patient insights, treatment recommendations, and analytics.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: BarChart3,
      title: 'Hospital Insights',
      description: 'Real-time hospital analytics including bed occupancy, resource allocation, and operational efficiency metrics.',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      icon: Heart,
      title: 'Patient Care',
      description: 'Personalized patient portals with health tracking, medication reminders, and direct communication with care teams.',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with HIPAA compliance, end-to-end encryption, and comprehensive audit trails.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Zap,
      title: 'Real-time Analytics',
      description: 'Instant data processing and real-time monitoring with automated alerts for critical patient conditions.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Role-based access control for doctors, administrators, and patients with customized interfaces.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Forecast patient trends, resource needs, and potential health outcomes to optimize care delivery.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Database,
      title: 'Data Integration',
      description: 'Seamless integration with existing EMR systems, lab results, and medical devices for comprehensive insights.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Continuous patient monitoring with intelligent alerts and automated early warning systems.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Award,
      title: 'Clinical Excellence',
      description: 'Evidence-based recommendations and clinical decision support to improve patient outcomes.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Stethoscope,
      title: 'Care Coordination',
      description: 'Streamlined communication and care coordination across departments and healthcare providers.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <section id="features" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <Zap className="h-4 w-4" />
            <span>Platform Features</span>
          </div>
          <h2 className="heading-secondary text-center">
            Everything you need for
            <span className="text-gradient"> modern healthcare</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and insights needed to deliver exceptional patient care 
            while optimizing hospital operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card-feature group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${feature.bgColor} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="heading-tertiary text-lg mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;