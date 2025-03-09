
import React from 'react';
import { Play, Pause, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  time: number;
  mode: 'pomodoro' | 'stopwatch';
  onStartPause: () => void;
  onReset: () => void;
  onSave?: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  time,
  mode,
  onStartPause,
  onReset,
  onSave,
}) => {
  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 hover:bg-secondary/70 transition-colors"
        onClick={onReset}
      >
        <RefreshCw className="h-5 w-5" />
      </Button>
      
      <Button
        variant={isRunning ? 'destructive' : 'default'}
        size="icon"
        className="rounded-full h-14 w-14 hover:scale-105 transition-transform"
        onClick={onStartPause}
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
          className="rounded-full h-12 w-12 hover:bg-secondary/70 transition-colors"
          onClick={onSave}
          disabled={time === 0}
        >
          <Clock className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default TimerControls;
