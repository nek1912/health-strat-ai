import React from 'react';
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp,
  Shield,
  Zap,
  Heart,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const stats = [
    { number: '500+', label: 'Hospitals Served', icon: Users, color: 'text-primary' },
    { number: '1M+', label: 'Patients Monitored', icon: Heart, color: 'text-red-500' },
    { number: '95%', label: 'Prediction Accuracy', icon: TrendingUp, color: 'text-green-600' },
    { number: '24/7', label: 'System Uptime', icon: Shield, color: 'text-blue-600' }
  ];

  const values = [
    {
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI and machine learning to solve complex healthcare challenges.',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Patient-Centric',
      description: 'Every feature is designed with patient outcomes and care quality as the top priority.',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Data Security',
      description: 'We maintain the highest standards of data protection with HIPAA compliance and encryption.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Evidence-Based',
      description: 'All our recommendations are backed by clinical research and real-world evidence.',
      icon: Award,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a mission to transform healthcare through AI' },
    { year: '2021', event: 'First Hospital Partnership', description: 'Deployed our platform in leading medical centers' },
    { year: '2022', event: 'FDA Approval', description: 'Received regulatory approval for clinical decision support' },
    { year: '2023', event: 'Series A Funding', description: 'Raised $50M to accelerate platform development' },
    { year: '2024', event: '500+ Hospitals', description: 'Reached milestone of serving over 500 healthcare facilities' }
  ];

  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <Target className="h-4 w-4" />
            <span>About HealthAI</span>
          </div>
          <h2 className="heading-secondary text-center">
            Pioneering the future of
            <span className="text-gradient"> intelligent healthcare</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We're on a mission to revolutionize healthcare by making AI-powered predictive analytics accessible to every hospital, 
            doctor, and patient. Our platform combines cutting-edge technology with deep clinical expertise to improve outcomes 
            and reduce costs across the entire healthcare ecosystem.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center space-y-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/50 rounded-2xl">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <div className="text-3xl lg:text-4xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Values */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Mission */}
          <div className="space-y-6">
            <h3 className="heading-tertiary">Our Mission</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize access to world-class healthcare intelligence by providing AI-powered tools that enable 
              healthcare providers to make better decisions, improve patient outcomes, and optimize operations.
            </p>
            <div className="space-y-3">
              {[
                'Reduce medical errors through predictive analytics',
                'Improve patient outcomes with personalized care',
                'Optimize hospital operations and resource allocation',
                'Enable proactive rather than reactive healthcare'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="space-y-4 p-6 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-all duration-300">
                <div className={`${value.bgColor} ${value.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <value.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <h3 className="heading-tertiary text-center">Our Journey</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary opacity-30 lg:transform lg:-translate-x-1/2"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:gap-16`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 lg:left-1/2 w-3 h-3 bg-primary rounded-full border-4 border-background shadow-medium lg:transform lg:-translate-x-1/2 z-10"></div>

                  {/* Content */}
                  <div className={`flex-1 ml-12 lg:ml-0 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                    <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                      <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">{milestone.event}</h4>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;