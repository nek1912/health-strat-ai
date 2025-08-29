import React from 'react';
import { 
  Upload, 
  Brain, 
  BarChart3, 
  ArrowRight,
  Database,
  Zap,
  TrendingUp
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Upload Patient Data',
      description: 'Securely integrate patient data from EMRs, lab results, and medical devices into our HIPAA-compliant platform.',
      icon: Upload,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      step: '02', 
      title: 'AI Analysis & Prediction',
      description: 'Our advanced machine learning algorithms analyze the data to predict health risks, outcomes, and treatment responses.',
      icon: Brain,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20'
    },
    {
      step: '03',
      title: 'Actionable Insights',
      description: 'Receive real-time dashboards, alerts, and evidence-based recommendations to optimize patient care and hospital operations.',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container-custom">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            <span>How It Works</span>
          </div>
          <h2 className="heading-secondary text-center">
            Transform healthcare in
            <span className="text-gradient"> three simple steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our streamlined process makes it easy to leverage AI for better patient outcomes and operational efficiency.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Flow */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8 relative">
              {/* Connecting Lines */}
              <div className="absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-purple-600 opacity-30"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-center space-y-6">
                    {/* Step Number */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${step.bgColor} ${step.color} font-bold text-lg border-2 ${step.borderColor} relative z-10 bg-background`}>
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className={`${step.bgColor} ${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105`}>
                      <step.icon className="h-10 w-10" />
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="heading-tertiary text-xl">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-20 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-6">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${step.bgColor} ${step.color} font-bold border-2 ${step.borderColor}`}>
                      {step.step}
                    </div>
                    <div className={`${step.bgColor} ${step.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-soft`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3 pt-2">
                    <h3 className="heading-tertiary text-lg">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connecting Line (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-24 w-0.5 h-8 bg-gradient-to-b from-muted-foreground/20 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-secondary">24/7</div>
            <div className="text-sm text-muted-foreground">Real-time Monitoring</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-purple-600">50%</div>
            <div className="text-sm text-muted-foreground">Faster Diagnoses</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-green-600">30%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;