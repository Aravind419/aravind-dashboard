import { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { formatTime, createStudySession, type StudySession } from '@/utils/timerUtils';
import { createTimerWorker } from '@/utils/timerWorker';
import TimerModeSelector from './timer/TimerModeSelector';
import PomodoroTimer from './timer/PomodoroTimer';
import SubjectSelector from './timer/SubjectSelector';
import TimerControls from './timer/TimerControls';

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
  const workerRef = useRef<Worker | null>(null);
  
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
  
  // Setup timer worker for background operation
  useEffect(() => {
    // Create a web worker for handling timer in background
    if (typeof Worker !== 'undefined' && !workerRef.current) {
      workerRef.current = createTimerWorker();
      
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'tick') {
          setTime(e.data.time);
        } else if (e.data.type === 'completed') {
          saveSession(pomodoroMinutes * 60);
          setIsRunning(false);
        }
      };
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  
  // React to running state changes
  useEffect(() => {
    if (isRunning && workerRef.current) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - (mode === 'stopwatch' ? time * 1000 : 0);
      }
      
      workerRef.current.postMessage({
        action: 'start',
        startTime: startTimeRef.current,
        isPomodoro: mode === 'pomodoro',
        totalTime: time
      });
    } else if (!isRunning && workerRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
    }
  }, [isRunning, mode]);
  
  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && workerRef.current) {
        // Sync the worker with current time when page becomes visible again
        workerRef.current.postMessage({ action: 'sync', time });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, time]);
  
  const clearTimers = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
    }
    if (timerIdRef.current !== null) {
      cancelAnimationFrame(timerIdRef.current);
      timerIdRef.current = null;
    }
    startTimeRef.current = null;
  };
  
  const saveSession = (duration: number) => {
    const newSession = createStudySession(duration, selectedSubject, subjects);
    if (newSession) {
      setStudySessions([...studySessions, newSession]);
    }
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

  const handleSaveAndReset = () => {
    if (time > 0) {
      saveSession(time);
      setTime(0);
      setIsRunning(false);
      clearTimers();
    }
  };
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <Timer className="h-5 w-5" />
        <span>Study Timer</span>
      </div>
      
      <div className="flex flex-col items-center">
        <TimerModeSelector mode={mode} setMode={setMode} />
        
        {mode === 'pomodoro' && (
          <PomodoroTimer 
            pomodoroMinutes={pomodoroMinutes} 
            setPomodoroMinutes={setPomodoroMinutes} 
          />
        )}
        
        <SubjectSelector 
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          subjects={subjects}
        />
        
        <div className="text-6xl font-mono font-semibold tracking-tight my-8">
          {formatTime(time)}
        </div>
        
        <TimerControls 
          isRunning={isRunning}
          time={time}
          mode={mode}
          onStartPause={handleStartPause}
          onReset={handleReset}
          onSave={mode === 'stopwatch' ? handleSaveAndReset : undefined}
        />
      </div>
    </div>
  );
};

export default StudyTimer;
