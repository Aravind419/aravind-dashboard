
import { useState, useEffect } from 'react';
import { GitCommit, Trophy, Hash, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';

interface LeetCodeProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  date: string;
  link?: string;
}

const HabitTracker = () => {
  const [problems, setProblems] = useLocalStorage<LeetCodeProblem[]>('leetcode-problems', []);
  const [newProblem, setNewProblem] = useState<Omit<LeetCodeProblem, 'id'>>({
    title: '',
    difficulty: 'Easy',
    date: new Date().toISOString().split('T')[0],
    link: '',
  });
  
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    calculateStreak();
  }, [problems]);
  
  const calculateStreak = () => {
    if (problems.length === 0) {
      setStreak(0);
      return;
    }
    
    // Sort problems by date
    const sortedProblems = [...problems].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's a problem solved today
    const latestProblemDate = new Date(sortedProblems[0].date);
    latestProblemDate.setHours(0, 0, 0, 0);
    
    // If the latest problem is not from today or yesterday, streak is broken
    if (today.getTime() - latestProblemDate.getTime() > 86400000 * 1) {
      setStreak(0);
      return;
    }
    
    // Calculate current streak
    let currentStreak = 1;
    let currentDate = latestProblemDate;
    
    // Get unique dates with problems
    const uniqueDates = new Set(sortedProblems.map(p => p.date));
    const uniqueDatesSorted = [...uniqueDates].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    // Count consecutive days
    for (let i = 1; i < uniqueDatesSorted.length; i++) {
      const prevDate = new Date(uniqueDatesSorted[i - 1]);
      prevDate.setHours(0, 0, 0, 0);
      
      const currDate = new Date(uniqueDatesSorted[i]);
      currDate.setHours(0, 0, 0, 0);
      
      // Check if dates are consecutive
      const diffTime = prevDate.getTime() - currDate.getTime();
      if (diffTime === 86400000) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };
  
  const addProblem = () => {
    if (!newProblem.title.trim()) return;
    
    const problem: LeetCodeProblem = {
      id: crypto.randomUUID(),
      ...newProblem,
    };
    
    setProblems([problem, ...problems]);
    setNewProblem({
      title: '',
      difficulty: 'Easy',
      date: new Date().toISOString().split('T')[0],
      link: '',
    });
  };
  
  const getDifficultyColor = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return '';
    }
  };
  
  // Create heat map data for the last 30 days
  const generateHeatMapData = () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return days.map(day => {
      const count = problems.filter(p => p.date === day).length;
      let intensity = 0;
      
      if (count === 1) intensity = 1;
      else if (count === 2) intensity = 2;
      else if (count >= 3) intensity = 3;
      
      return { day, count, intensity };
    });
  };
  
  const heatMapData = generateHeatMapData();
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <GitCommit className="h-5 w-5" />
        <span>LeetCode Tracker</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-4 space-x-4">
            <div className="bg-secondary/50 rounded-xl flex-1 p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Streak</h3>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                <p className="text-2xl font-semibold">{streak} days</p>
              </div>
            </div>
            
            <div className="bg-secondary/50 rounded-xl flex-1 p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Problems</h3>
              <div className="flex items-center">
                <Hash className="h-5 w-5 mr-2 text-primary" />
                <p className="text-2xl font-semibold">{problems.length}</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-sm font-medium mb-2">Add New Problem</h3>
          <div className="space-y-3">
            <Input
              placeholder="Problem Title"
              value={newProblem.title}
              onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
            />
            
            <div className="flex gap-3">
              <Select
                value={newProblem.difficulty}
                onValueChange={(value) => setNewProblem({ ...newProblem, difficulty: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={newProblem.date}
                onChange={(e) => setNewProblem({ ...newProblem, date: e.target.value })}
              />
            </div>
            
            <Input
              placeholder="LeetCode URL (optional)"
              value={newProblem.link || ''}
              onChange={(e) => setNewProblem({ ...newProblem, link: e.target.value })}
            />
            
            <Button 
              className="w-full"
              onClick={addProblem}
              disabled={!newProblem.title.trim()}
            >
              Add Problem
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Activity</h3>
          <div className="flex flex-wrap gap-1 mb-4">
            {heatMapData.map((day, i) => (
              <div 
                key={i}
                className={`h-4 w-4 rounded-sm transition-colors ${
                  day.intensity === 0 ? 'bg-secondary/70' :
                  day.intensity === 1 ? 'bg-primary/30' :
                  day.intensity === 2 ? 'bg-primary/60' : 'bg-primary'
                }`}
                title={`${day.day}: ${day.count} problems`}
              />
            ))}
          </div>
          
          <h3 className="text-sm font-medium mb-2">Recent Problems</h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {problems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Github className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No problems tracked yet.</p>
                <p className="text-sm">Add your first LeetCode problem above.</p>
              </div>
            ) : (
              problems.slice(0, 10).map((problem) => (
                <div 
                  key={problem.id}
                  className="p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {problem.link ? (
                        <a 
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {problem.title}
                        </a>
                      ) : (
                        <span className="font-medium">{problem.title}</span>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {new Date(problem.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
