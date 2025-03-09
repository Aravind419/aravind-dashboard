
import { useState } from 'react';
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLocalStorage from '@/hooks/useLocalStorage';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [newTaskText, setNewTaskText] = useState('');
  
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };
  
  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const getDateLabel = (isoString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const taskDate = new Date(isoString);
    
    if (taskDate >= today) {
      return 'Today';
    } else if (taskDate >= yesterday) {
      return 'Yesterday';
    } else {
      // Format for older dates
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(taskDate);
    }
  };
  
  // Group tasks by date
  const groupedTasks = tasks.reduce((acc, task) => {
    const dateLabel = getDateLabel(task.createdAt);
    
    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    
    acc[dateLabel].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Get incomplete and completed tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <CheckSquare className="h-5 w-5" />
        <span>Task Manager</span>
      </div>
      
      <div className="mb-4 flex">
        <Input
          className="rounded-r-none"
          placeholder="Add a new task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTask();
            }
          }}
        />
        <Button 
          onClick={addTask}
          className="rounded-l-none"
          disabled={!newTaskText.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending ({incompleteTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {Object.entries(groupedTasks).map(([dateLabel, dateTasks]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{dateLabel}</h3>
              <ul className="space-y-1">
                {dateTasks.map(task => (
                  <li 
                    key={task.id}
                    className="flex items-center group justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <button
                      className="flex items-center flex-1 text-left"
                      onClick={() => toggleTaskCompletion(task.id)}
                    >
                      <span className="mr-3 text-muted-foreground">
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </span>
                      <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.text}
                      </span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No tasks yet. Add a new task to get started.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-1">
          {incompleteTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No pending tasks. All caught up!
            </div>
          ) : (
            <ul className="space-y-1">
              {incompleteTasks.map(task => (
                <li 
                  key={task.id}
                  className="flex items-center group justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <button
                    className="flex items-center flex-1 text-left"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    <span className="mr-3 text-muted-foreground">
                      <Circle className="h-5 w-5" />
                    </span>
                    <span>{task.text}</span>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-1">
          {completedTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No completed tasks yet.
            </div>
          ) : (
            <ul className="space-y-1">
              {completedTasks.map(task => (
                <li 
                  key={task.id}
                  className="flex items-center group justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <button
                    className="flex items-center flex-1 text-left"
                    onClick={() => toggleTaskCompletion(task.id)}
                  >
                    <span className="mr-3 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </span>
                    <span className="line-through text-muted-foreground">
                      {task.text}
                    </span>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManager;
