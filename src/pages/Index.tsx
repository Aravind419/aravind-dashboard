
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import StudyTimer from '@/components/dashboard/StudyTimer';
import TaskManager from '@/components/dashboard/TaskManager';
import ProgressTracker from '@/components/dashboard/ProgressTracker';
import HabitTracker from '@/components/dashboard/HabitTracker';
import Notes from '@/components/dashboard/Notes';
import SocialMediaManager from '@/components/dashboard/SocialMediaManager';
import CertificateStorage from '@/components/dashboard/CertificateStorage';
import SpendingTracker from '@/components/dashboard/SpendingTracker';
import { toast } from 'sonner';

const Index = () => {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
    
    // Smooth scroll to section if URL has hash
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Welcome toast
    toast.success('Welcome to Aravind Dashboard', {
      description: 'Track your study progress, habits, and more in one place.'
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container pt-24 pb-16 px-4 md:px-6">
        <section className="mb-6 animate-fade-in">
          <h1 className="heading-1 mb-2">Aravind Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress, habits, and more in one place.</p>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section id="timer" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <StudyTimer />
          </section>
          
          <section id="tasks" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <TaskManager />
          </section>
          
          <section id="progress" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <ProgressTracker />
          </section>
          
          <section id="leetcode" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <HabitTracker />
          </section>
          
          <section id="spending" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <SpendingTracker />
          </section>
          
          <section id="social" className="md:col-span-1 hover:scale-[1.01] transition-transform">
            <SocialMediaManager />
          </section>
          
          <section id="certificates" className="md:col-span-2 hover:scale-[1.01] transition-transform">
            <CertificateStorage />
          </section>
          
          <section id="notes" className="md:col-span-2 hover:scale-[1.01] transition-transform">
            <Notes />
          </section>
        </div>
        
        <footer className="mt-12 py-4 text-center text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} All rights reserved by Aravind
        </footer>
      </main>
    </div>
  );
};

export default Index;
