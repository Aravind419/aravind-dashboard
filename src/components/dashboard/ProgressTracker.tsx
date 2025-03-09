
import { useEffect, useRef, useState } from 'react';
import { BarChart3, BarChart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Array of colors for subjects
const subjectColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#C9CBCF', '#7F8487'
];

const ProgressTracker = () => {
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('study-subjects', []);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  // Add a new subject
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    
    // Check if subject already exists
    if (subjects.some(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
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
  };
  
  // Delete a subject and its associated sessions
  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setStudySessions(studySessions.filter(session => 
      !subjects.find(s => s.id === subjectId)?.name.includes(session.subject)
    ));
    
    if (selectedSubject === subjectId) {
      setSelectedSubject('all');
    }
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
          id: crypto.randomUUID(),
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
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={selectedSubject === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSubject('all')}
            className="py-1 h-8"
          >
            All Subjects
          </Button>
          
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center">
              <Button
                variant={selectedSubject === subject.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(subject.id)}
                className="py-1 h-8 pr-1"
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
                  className="h-6 w-6 ml-1"
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
      
      {selectedSubject === 'all' && subjects.length > 1 && studySessions.length > 0 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(getSubjectTotals())
            .sort(([, timeA], [, timeB]) => timeB - timeA)
            .map(([subjectName, time]) => {
              const subject = subjects.find(s => s.name === subjectName);
              return (
                <div
                  key={subjectName}
                  className="flex items-center p-2 rounded-lg"
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
