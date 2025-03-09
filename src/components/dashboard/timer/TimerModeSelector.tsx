
import React from 'react';
import { Button } from '@/components/ui/button';

interface TimerModeSelectorProps {
  mode: 'pomodoro' | 'stopwatch';
  setMode: (mode: 'pomodoro' | 'stopwatch') => void;
}

const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({
  mode,
  setMode,
}) => {
  return (
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
  );
};

export default TimerModeSelector;
