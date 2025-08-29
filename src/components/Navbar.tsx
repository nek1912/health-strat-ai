import React, { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">HealthAI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 hover:scale-105"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="font-semibold"
              onClick={() => window.location.href = '/auth?role=doctor'}
            >
              Doctor Login
            </Button>
            <Button 
              variant="outline"
              className="px-6 py-2 font-semibold"
              onClick={() => window.location.href = '/auth?role=patient'}
            >
              Patient Login
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-semibold"
              onClick={() => window.location.href = '/auth?role=admin'}
            >
              Admin Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center"
                  onClick={() => window.location.href = '/auth?role=doctor'}
                >
                  Doctor Login
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => window.location.href = '/auth?role=patient'}
                >
                  Patient Login
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => window.location.href = '/auth?role=admin'}
                >
                  Admin Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;