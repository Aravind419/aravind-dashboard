
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get(`${API_URL}/theme`);
        const savedTheme = response.data.value as 'light' | 'dark';
        setTheme(savedTheme || 'dark');
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } catch (error) {
        console.error('Error fetching theme:', error);
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const fallbackTheme = prefersDark ? 'dark' : 'light';
        setTheme(fallbackTheme);
        document.documentElement.classList.toggle('dark', fallbackTheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTheme();
  }, []);
  
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    try {
      await axios.post(`${API_URL}/theme`, { value: newTheme });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full"
        disabled
      >
        <Sun size={20} className="opacity-50" />
      </Button>
    );
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full transition-colors hover:bg-secondary"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="transition-all" />
      ) : (
        <Moon size={20} className="transition-all" />
      )}
    </Button>
  );
};

export default ThemeToggle;
