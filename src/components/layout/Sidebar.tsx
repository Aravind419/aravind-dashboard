
import { useEffect } from 'react';
import { X, Timer, CheckSquare, BarChart3, GitCommit, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  // Handle click outside to close on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onClose();
    }
  };
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div 
        id="mobile-sidebar"
        className={`fixed top-0 left-0 h-full w-[280px] glass-panel z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold">StudySculptor</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </Button>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-lg h-12 text-base"
                  onClick={() => scrollToSection('timer')}
                >
                  <Timer size={20} />
                  Study Timer
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-lg h-12 text-base"
                  onClick={() => scrollToSection('tasks')}
                >
                  <CheckSquare size={20} />
                  Task Manager
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-lg h-12 text-base"
                  onClick={() => scrollToSection('progress')}
                >
                  <BarChart3 size={20} />
                  Progress Tracker
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-lg h-12 text-base"
                  onClick={() => scrollToSection('leetcode')}
                >
                  <GitCommit size={20} />
                  LeetCode Tracker
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-lg h-12 text-base"
                  onClick={() => scrollToSection('notes')}
                >
                  <BookOpen size={20} />
                  Notes
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
