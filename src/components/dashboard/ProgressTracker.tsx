
import { useEffect, useRef, useState } from 'react';
import { BarChart3, BarChart, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';

interface StudySession {
  id: string;
  subject: string;
  date: string;
  duration: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface DailyProgress {
  id: string;
  date: string;
  subjectHours: { [subjectId: string]: number };
}

// Array of colors for subjects
const subjectColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#C9CBCF', '#7F8487'
];

const ProgressTracker = () => {
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('study-subjects', []);
  const [dailyProgress, setDailyProgress] = useLocalStorage<DailyProgress[]>('daily-progress', []);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [hoursSpent, setHoursSpent] = useState('');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  // Add a new subject
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    
    // Check if subject already exists
    if (subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast.error('Subject already exists');
      setNewSubjectName('');
      return;
    }
    
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: newSubjectName.trim(),
      color: subjectColors[subjects.length % subjectColors.length]
    };
    
    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    toast.success('Subject added successfully');
  };
  
  // Add hours spent on a subject manually
  const handleAddHours = () => {
    if (!hoursSpent || selectedSubject === 'all') return;
    
    const hours = parseFloat(hoursSpent);
    if (isNaN(hours) || hours <= 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'General';
    
    // Create new study session entry
    const newSession: StudySession = {
      id: crypto.randomUUID(),
      subject: subjectName,
      date: today,
      duration: hours * 3600 // Convert hours to seconds
    };
    
    setStudySessions([...studySessions, newSession]);
    setHoursSpent('');
    toast.success(`Added ${hours} hours for ${subjectName}`);
    
    // Update daily progress
    updateDailyProgress(selectedSubject, hours);
  };
  
  // Update daily progress tracker
  const updateDailyProgress = (subjectId: string, hours: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already an entry for today
    const existingProgress = dailyProgress.find(p => p.date === today);
    
    if (existingProgress) {
      // Update existing entry
      const updatedProgress = dailyProgress.map(p => {
        if (p.date === today) {
          return {
            ...p,
            subjectHours: {
              ...p.subjectHours,
              [subjectId]: (p.subjectHours[subjectId] || 0) + hours
            }
          };
        }
        return p;
      });
      setDailyProgress(updatedProgress);
    } else {
      // Create new entry
      const newProgress: DailyProgress = {
        id: crypto.randomUUID(),
        date: today,
        subjectHours: {
          [subjectId]: hours
        }
      };
      setDailyProgress([...dailyProgress, newProgress]);
    }
  };
  
  // Delete a subject and its associated sessions
  const handleDeleteSubject = (subjectId: string) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    if (!subjectToDelete) return;
    
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setStudySessions(studySessions.filter(session => 
      session.subject !== subjectToDelete.name
    ));
    
    if (selectedSubject === subjectId) {
      setSelectedSubject('all');
    }
    
    toast.success(`Deleted subject: ${subjectToDelete.name}`);
  };
  
  // Update existing study sessions to include subject info
  useEffect(() => {
    // For backward compatibility, add subject to old study sessions
    const updatedSessions = studySessions.map(session => {
      if (!session.id) {
        return {
          ...session,
          id: crypto.randomUUID(),
          subject: session.subject || 'General'
        };
      }
      if (!session.subject) {
        return {
          ...session,
          subject: 'General'
        };
      }
      return session;
    });
    
    if (JSON.stringify(updatedSessions) !== JSON.stringify(studySessions)) {
      setStudySessions(updatedSessions);
    }
    
    // Add 'General' subject if not present and there are sessions
    if (updatedSessions.length > 0 && 
        !subjects.some(s => s.name === 'General')) {
      setSubjects([
        ...subjects,
        {
          id: 'general',
          name: 'General',
          color: '#7F8487'
        }
      ]);
    }
  }, []);
  
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
        
        // Filter sessions by selected subject
        const filteredSessions = selectedSubject === 'all' 
          ? studySessions 
          : studySessions.filter(session => {
              const subjectName = subjects.find(s => s.id === selectedSubject)?.name;
              return session.subject === subjectName;
            });
        
        // Group sessions by date and subject
        const sessionsByDay = last7Days.map(date => {
          const sessionsOnDay = filteredSessions.filter(s => s.date === date);
          if (selectedSubject !== 'all') {
            // Single subject view
            return {
              date,
              duration: sessionsOnDay.reduce((sum, session) => sum + session.duration, 0)
            };
          } else {
            // All subjects view - group by subject
            const subjectDurations: Record<string, number> = {};
            
            sessionsOnDay.forEach(session => {
              if (!subjectDurations[session.subject]) {
                subjectDurations[session.subject] = 0;
              }
              subjectDurations[session.subject] += session.duration;
            });
            
            return {
              date,
              subjectDurations
            };
          }
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
        
        // Create datasets for chart
        let datasets = [];
        
        if (selectedSubject === 'all') {
          // Create a dataset for each subject
          const subjectNames = Array.from(new Set(studySessions.map(s => s.subject)));
          
          datasets = subjectNames.map(subjectName => {
            const subject = subjects.find(s => s.name === subjectName);
            const color = subject?.color || '#7F8487';
            
            return {
              label: subjectName,
              data: sessionsByDay.map(day => {
                return day.subjectDurations?.[subjectName] 
                  ? Math.round(day.subjectDurations[subjectName] / 60) // Convert seconds to minutes
                  : 0;
              }),
              backgroundColor: color,
              borderColor: color,
              borderWidth: 1,
              borderRadius: 6,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
              stack: 'Stack 0'
            };
          });
        } else {
          // Single subject view
          const subject = subjects.find(s => s.id === selectedSubject);
          
          datasets = [{
            label: subject?.name || 'Study Time',
            data: sessionsByDay.map(day => 
              Math.round((day.duration || 0) / 60) // Convert seconds to minutes
            ),
            backgroundColor: subject?.color || 'rgba(59, 130, 246, 0.5)',
            borderColor: subject?.color || 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20,
          }];
        }
        
        // Create new chart
        const newChartInstance = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: selectedSubject === 'all' && datasets.length > 0,
                position: 'top',
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
                stacked: selectedSubject === 'all',
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
                stacked: selectedSubject === 'all',
                grid: {
                  display: false,
                },
              },
            },
            animation: {
              duration: 800,
              easing: 'easeOutBounce'
            }
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
  }, [studySessions, subjects, selectedSubject]);
  
  // Calculate total study time for the week
  const weeklyTotal = studySessions.reduce((total, session) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    if (sessionDate >= oneWeekAgo && sessionDate <= now) {
      if (selectedSubject === 'all' || 
          session.subject === subjects.find(s => s.id === selectedSubject)?.name) {
        return total + session.duration;
      }
    }
    
    return total;
  }, 0);
  
  // Format total time
  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Get subject totals for the week
  const getSubjectTotals = () => {
    const subjectTotals: Record<string, number> = {};
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      
      if (sessionDate >= oneWeekAgo && sessionDate <= now) {
        if (!subjectTotals[session.subject]) {
          subjectTotals[session.subject] = 0;
        }
        subjectTotals[session.subject] += session.duration;
      }
    });
    
    return subjectTotals;
  };
  
  // Get previous day's progress
  const getPreviousDayProgress = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    return dailyProgress.find(p => p.date === yesterdayString);
  };
  
  const previousDayProgress = getPreviousDayProgress();
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <BarChart3 className="h-5 w-5" />
        <span>Progress Tracker</span>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Add new subject..."
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubject();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleAddSubject}
            disabled={!newSubjectName.trim()}
            className="hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
        
        {selectedSubject !== 'all' && (
          <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Hours spent today"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              className="w-full sm:w-1/2"
            />
            <Button 
              onClick={handleAddHours}
              disabled={!hoursSpent || parseFloat(hoursSpent) <= 0}
              className="w-full sm:w-auto hover:scale-105 transition-transform"
            >
              <Clock className="h-4 w-4 mr-2" />
              Record Hours
            </Button>
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={selectedSubject === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSubject('all')}
            className="py-1 h-8 hover:scale-105 transition-transform"
          >
            All Subjects
          </Button>
          
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center">
              <Button
                variant={selectedSubject === subject.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(subject.id)}
                className="py-1 h-8 pr-1 hover:scale-105 transition-transform"
                style={{
                  backgroundColor: selectedSubject === subject.id ? subject.color : 'transparent',
                  borderColor: subject.color,
                  color: selectedSubject === subject.id ? 'white' : undefined
                }}
              >
                <span 
                  className="mr-1 inline-block w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: selectedSubject === subject.id ? 'white' : subject.color 
                  }}
                />
                {subject.name}
              </Button>
              
              {subject.name !== 'General' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => handleDeleteSubject(subject.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Weekly Total</h3>
          <p className="text-2xl font-semibold">{formatTotalTime(weeklyTotal)}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Daily Average</h3>
          <p className="text-2xl font-semibold">
            {formatTotalTime(Math.round(weeklyTotal / 7))}
          </p>
        </div>
      </div>
      
      {previousDayProgress && (
        <div className="mb-4 bg-secondary/30 rounded-xl p-4 animate-fade-in">
          <h3 className="text-sm font-semibold mb-2">Yesterday's Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(previousDayProgress.subjectHours).map(([subjectId, hours]) => {
              const subject = subjects.find(s => s.id === subjectId);
              if (!subject) return null;
              
              return (
                <div 
                  key={subjectId}
                  className="flex items-center p-2 rounded-lg hover:bg-secondary/20 transition-colors"
                  style={{ backgroundColor: `${subject.color}10` }}
                >
                  <span 
                    className="mr-2 inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="flex-1 truncate">{subject.name}</span>
                  <span className="font-medium">{hours.toFixed(1)}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedSubject === 'all' && subjects.length > 1 && studySessions.length > 0 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(getSubjectTotals())
            .sort(([, timeA], [, timeB]) => timeB - timeA)
            .map(([subjectName, time]) => {
              const subject = subjects.find(s => s.name === subjectName);
              return (
                <div
                  key={subjectName}
                  className="flex items-center p-2 rounded-lg hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: `${subject?.color}20` }}
                >
                  <span 
                    className="mr-2 inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject?.color }}
                  />
                  <span className="flex-1 truncate">{subjectName}</span>
                  <span className="font-medium">{formatTotalTime(time)}</span>
                </div>
              );
            })}
        </div>
      )}
      
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
