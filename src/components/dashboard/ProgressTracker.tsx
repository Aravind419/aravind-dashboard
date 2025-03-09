
import { useEffect, useRef, useState } from 'react';
import { BarChart3, BarChart } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';

interface StudySession {
  date: string;
  duration: number;
}

const ProgressTracker = () => {
  const [studySessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  useEffect(() => {
    const loadChart = async () => {
      if (!chartRef.current) return;
      
      try {
        // Dynamically import Chart.js to avoid server-side rendering issues
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);
        
        // Prepare data for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        // Get study durations for the last 7 days
        const durations = last7Days.map(date => {
          const session = studySessions.find(s => s.date === date);
          return session ? Math.round(session.duration / 60) : 0; // Convert seconds to minutes
        });
        
        // Format dates for display
        const labels = last7Days.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        
        // Destroy previous chart if it exists
        if (chartInstance) {
          chartInstance.destroy();
        }
        
        // Create new chart
        const newChartInstance = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Study Minutes',
                data: durations,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 20,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    return `${value} minutes`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(107, 114, 128, 0.1)',
                },
                ticks: {
                  stepSize: 30,
                  callback: (value) => `${value}m`,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
        
        setChartInstance(newChartInstance);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    };
    
    loadChart();
    
    // Cleanup
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [studySessions, chartInstance]);
  
  // Calculate total study time for the week
  const weeklyTotal = studySessions.reduce((total, session) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    if (sessionDate >= oneWeekAgo && sessionDate <= now) {
      return total + session.duration;
    }
    
    return total;
  }, 0);
  
  // Format total time
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <BarChart3 className="h-5 w-5" />
        <span>Progress Tracker</span>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Weekly Total</h3>
          <p className="text-2xl font-semibold">{formatTotalTime(weeklyTotal)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Daily Average</h3>
          <p className="text-2xl font-semibold">
            {formatTotalTime(Math.round(weeklyTotal / 7))}
          </p>
        </div>
      </div>
      
      <div className="h-64 relative">
        {studySessions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No study data yet.</p>
              <p className="text-sm">Start the timer to track your progress.</p>
            </div>
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
