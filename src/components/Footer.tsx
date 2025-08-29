import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
  Shield,
  Heart,
  Award
} from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Platform: [
      { name: 'Doctor Dashboard', href: '/auth?role=doctor&next=%2Fdoctor' },
      { name: 'Admin Portal', href: '/auth?role=admin&next=%2Fadmin' },
      { name: 'Patient Access', href: '/auth?role=patient&next=%2Fpatient' },
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#' },
      { name: 'News & Updates', href: '#' },
      { name: 'Partner Program', href: '#' }
    ],
    Support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Support', href: '#contact' },
      { name: 'Training Resources', href: '#' },
      { name: 'System Status', href: '#' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Compliance', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' },
    { icon: Facebook, href: '#', name: 'Facebook' }
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-card border-t border-border/50">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">HealthAI</span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              Transforming healthcare with AI-powered predictive analytics for better patient outcomes and operational efficiency.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-600" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-red-500" />
                <span>FDA Approved</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-primary" />
                <span>ISO 27001 Certified</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="bg-muted hover:bg-primary hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-semibold text-foreground">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t border-border/50">
        <div className="container-custom py-8">
          <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">contact@healthai.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-muted/30">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              &copy; 2024 HealthAI. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button 
                onClick={() => scrollToSection('#')}
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => scrollToSection('#')}
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => scrollToSection('#')}
                className="hover:text-primary transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;