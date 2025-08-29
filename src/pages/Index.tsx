import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import RoleAccess from '@/components/RoleAccess';
import HowItWorks from '@/components/HowItWorks';
import About from '@/components/About';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <RoleAccess />
        <HowItWorks />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;