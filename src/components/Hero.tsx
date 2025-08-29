import React from 'react';
import { ArrowRight, Play, TrendingUp, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-healthcare.jpg';

const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="section-padding pt-24 bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>AI-Powered Healthcare Analytics</span>
              </div>
              
              <h1 className="heading-primary">
                <span className="text-gradient">AI-Powered Healthcare</span>
                <br />
                Risk & Outcome Prediction
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Helping doctors and hospitals make better decisions with real-time patient insights, 
                predictive analytics, and personalized treatment recommendations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => scrollToSection('#roles')}
                className="btn-hero group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => scrollToSection('#features')}
                className="btn-outline group"
              >
                <Play className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">500+ Hospitals</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Healthcare AI Dashboard"
                className="rounded-3xl shadow-large w-full h-auto animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-3xl"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-medium animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-medium animate-fade-in" style={{animationDelay: '0.7s'}}>
              <div className="text-2xl font-bold text-secondary">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;