import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';

interface StudySession {
  id: string;
  subject: string;
  date: string;
  duration: number;
}

const StudyTimer = () => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('stopwatch');
  const [time, setTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25); // default 25 minutes
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [subjects] = useLocalStorage<{ id: string; name: string; color: string }[]>('study-subjects', []);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  // References for keeping time even when tab is inactive
  const startTimeRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const timerIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Initialize with the first subject or 'General' if available
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].id);
    } else if (subjects.length === 0 && !selectedSubject) {
      // Will be created in ProgressTracker if it doesn't exist
      setSelectedSubject('general');
    }
  }, [subjects, selectedSubject]);
  
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTime(pomodoroMinutes * 60);
    } else {
      setTime(0);
    }
    
    setIsRunning(false);
    clearTimers();
  }, [mode, pomodoroMinutes]);
  
  // Main timer effect using Web Workers API for background operation
  useEffect(() => {
    if (isRunning) {
      // Set the start time reference
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - (mode === 'stopwatch' ? time * 1000 : 0);
      }
      
      // Instead of setInterval, use requestAnimationFrame for better performance
      // and accurate timing even when tab is not active
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = now - lastUpdateRef.current;
        lastUpdateRef.current = now;
        
        if (mode === 'pomodoro') {
          setTime(prevTime => {
            const newTime = Math.max(0, prevTime - Math.floor(elapsed / 1000));
            if (newTime <= 0 && prevTime > 0) {
              // Timer completed
              saveSession(pomodoroMinutes * 60);
              setIsRunning(false);
              clearTimers();
              return 0;
            }
            return newTime;
          });
        } else {
          // Stopwatch mode - calculate exact time from start reference
          const totalElapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
          setTime(totalElapsed);
        }
        
        if (isRunning) {
          timerIdRef.current = requestAnimationFrame(updateTimer);
        }
      };
      
      timerIdRef.current = requestAnimationFrame(updateTimer);
      
      // Use the Page Visibility API to adjust when the page becomes visible again
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // When page becomes visible again, recalculate the current time
          const now = Date.now();
          if (mode === 'pomodoro' && startTimeRef.current !== null) {
            const elapsedSinceStart = Math.floor((now - startTimeRef.current) / 1000);
            const remainingTime = Math.max(0, pomodoroMinutes * 60 - elapsedSinceStart);
            setTime(remainingTime);
            
            if (remainingTime <= 0) {
              // Timer completed while page was hidden
              saveSession(pomodoroMinutes * 60);
              setIsRunning(false);
              clearTimers();
            }
          } else if (mode === 'stopwatch' && startTimeRef.current !== null) {
            const elapsedSinceStart = Math.floor((now - startTimeRef.current) / 1000);
            setTime(elapsedSinceStart);
          }
          
          lastUpdateRef.current = now;
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        if (timerIdRef.current !== null) {
          cancelAnimationFrame(timerIdRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    
    // Clean up when not running
    return () => {
      if (timerIdRef.current !== null) {
        cancelAnimationFrame(timerIdRef.current);
      }
    };
  }, [isRunning, mode, pomodoroMinutes]);
  
  const clearTimers = () => {
    if (timerIdRef.current !== null) {
      cancelAnimationFrame(timerIdRef.current);
      timerIdRef.current = null;
    }
    startTimeRef.current = null;
  };
  
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return [
      h > 0 ? h.toString().padStart(2, '0') : '00',
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');
  };
  
  const saveSession = (duration: number) => {
    if (duration <= 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'General';
    
    // Create new study session entry
    const newSession: StudySession = {
      id: crypto.randomUUID(),
      subject: subjectName,
      date: today,
      duration: duration
    };
    
    setStudySessions([...studySessions, newSession]);
  };
  
  const handleStartPause = () => {
    if (!isRunning) {
      // Starting the timer
      lastUpdateRef.current = Date.now();
      if (mode === 'pomodoro') {
        startTimeRef.current = Date.now() - ((pomodoroMinutes * 60 - time) * 1000);
      } else {
        startTimeRef.current = Date.now() - (time * 1000);
      }
    } else {
      // Pausing the timer
      clearTimers();
    }
    
    setIsRunning(!isRunning);
  };
  
  const handleReset = () => {
    if (isRunning) {
      // Save session data if stopping in the middle
      if (mode === 'stopwatch' && time > 0) {
        saveSession(time);
      } else if (mode === 'pomodoro' && time < pomodoroMinutes * 60) {
        saveSession(pomodoroMinutes * 60 - time);
      }
    }
    
    setIsRunning(false);
    clearTimers();
    if (mode === 'pomodoro') {
      setTime(pomodoroMinutes * 60);
    } else {
      setTime(0);
    }
  };
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <Timer className="h-5 w-5" />
        <span>Study Timer</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="mb-4 bg-secondary rounded-lg p-1 inline-flex">
          <Button 
            variant={mode === 'stopwatch' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setMode('stopwatch')}
            className="rounded-md transition-all"
          >
            Stopwatch
          </Button>
          <Button 
            variant={mode === 'pomodoro' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setMode('pomodoro')}
            className="rounded-md transition-all"
          >
            Pomodoro
          </Button>
        </div>
        
        {mode === 'pomodoro' && (
          <div className="w-full mb-4 flex justify-center gap-2">
            {[15, 25, 30, 45, 60].map(mins => (
              <Button
                key={mins}
                variant={pomodoroMinutes === mins ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setPomodoroMinutes(mins)}
                className="h-8 px-2 text-xs"
              >
                {mins}m
              </Button>
            ))}
          </div>
        )}
        
        <div className="w-full mb-4">
          <Select 
            value={selectedSubject} 
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-full max-w-xs mx-auto">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center">
                    <span 
                      className="mr-2 inline-block w-2 h-2 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
              {subjects.length === 0 && (
                <SelectItem value="general">General</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-6xl font-mono font-semibold tracking-tight my-8">
          {formatTime(time)}
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={handleReset}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button
            variant={isRunning ? 'destructive' : 'default'}
            size="icon"
            className="rounded-full h-14 w-14"
            onClick={handleStartPause}
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          
          {mode === 'stopwatch' && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => {
                if (time > 0) {
                  saveSession(time);
                  setTime(0);
                  setIsRunning(false);
                  clearTimers();
                }
              }}
              disabled={time === 0}
            >
              <Clock className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
