
import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/useLocalStorage';

interface StudySession {
  date: string;
  duration: number;
}

const StudyTimer = () => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('stopwatch');
  const [time, setTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25); // default 25 minutes
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (mode === 'pomodoro') {
      setTime(pomodoroMinutes * 60);
    } else {
      setTime(0);
    }
    
    setIsRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode, pomodoroMinutes]);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (mode === 'pomodoro' && prevTime <= 1) {
            setIsRunning(false);
            // Save session when timer completes
            saveSession(pomodoroMinutes * 60);
            return 0;
          }
          
          return mode === 'pomodoro' ? prevTime - 1 : prevTime + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, pomodoroMinutes]);
  
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
    
    // Check if we already have a session for today
    const existingSessionIndex = studySessions.findIndex(
      session => session.date === today
    );
    
    if (existingSessionIndex >= 0) {
      // Update existing session
      const updatedSessions = [...studySessions];
      updatedSessions[existingSessionIndex].duration += duration;
      setStudySessions(updatedSessions);
    } else {
      // Add new session
      setStudySessions([...studySessions, { date: today, duration }]);
    }
  };
  
  const handleStartPause = () => {
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
