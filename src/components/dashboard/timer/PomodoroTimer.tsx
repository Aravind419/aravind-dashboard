
import React from 'react';
import { Button } from '@/components/ui/button';

interface PomodoroTimerProps {
  pomodoroMinutes: number;
  setPomodoroMinutes: (minutes: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  pomodoroMinutes,
  setPomodoroMinutes,
}) => {
  return (
    <div className="w-full mb-4 flex justify-center gap-2">
      {[15, 25, 30, 45, 60].map(mins => (
        <Button
          key={mins}
          variant={pomodoroMinutes === mins ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setPomodoroMinutes(mins)}
          className="h-8 px-2 text-xs hover:scale-105 transition-transform"
        >
          {mins}m
        </Button>
      ))}
    </div>
  );
};

export default PomodoroTimer;
