
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import StudyTimer from '@/components/dashboard/StudyTimer';
import TaskManager from '@/components/dashboard/TaskManager';
import ProgressTracker from '@/components/dashboard/ProgressTracker';
import HabitTracker from '@/components/dashboard/HabitTracker';
import Notes from '@/components/dashboard/Notes';

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
  }, []);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container pt-24 pb-16 px-4 md:px-6">
        <section className="mb-6">
          <h1 className="heading-1 mb-2">Study Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress and habits in one place.</p>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section id="timer" className="md:col-span-1">
            <StudyTimer />
          </section>
          
          <section id="tasks" className="md:col-span-1">
            <TaskManager />
          </section>
          
          <section id="progress" className="md:col-span-1">
            <ProgressTracker />
          </section>
          
          <section id="leetcode" className="md:col-span-1">
            <HabitTracker />
          </section>
          
          <section id="notes" className="md:col-span-2">
            <Notes />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
