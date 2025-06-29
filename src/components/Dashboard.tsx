
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, TrendingUp } from "lucide-react";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import ShareTaskDialog from "./ShareTaskDialog";
import { toast } from "@/hooks/use-toast";

// Mock data - in real app this would come from backend/Supabase
const mockTasks = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finish the Q4 project proposal and send it to the team for review.',
    completed: false,
    priority: 'high' as const,
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'in-progress' as const,
    sharedWith: ['john@example.com']
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review the pull requests from the development team.',
    completed: false,
    priority: 'medium' as const,
    dueDate: new Date().toISOString(), // Today
    status: 'todo' as const,
    sharedWith: []
  },
  {
    id: '3',
    title: 'Schedule team meeting',
    description: 'Set up weekly sync meeting with the entire team.',
    completed: true,
    priority: 'low' as const,
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'completed' as const,
    sharedWith: ['sarah@example.com', 'mike@example.com']
  },
  {
    id: '4',
    title: 'Update documentation',
    description: 'Update the API documentation with the latest changes.',
    completed: false,
    priority: 'medium' as const,
    dueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago (overdue)
    status: 'todo' as const,
    sharedWith: []
  }
];

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'completed';
  sharedWith?: string[];
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sharingTaskId, setSharingTaskId] = useState<string>('');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      const today = new Date().toDateString();
      const taskDate = task.dueDate ? new Date(task.dueDate).toDateString() : null;
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

      switch (activeFilter) {
        case 'due-today':
          return taskDate === today;
        case 'overdue':
          return isOverdue;
        case 'completed':
          return task.completed;
        case 'in-progress':
          return task.status === 'in-progress';
        default:
          return true;
      }
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'dueDate':
        default:
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

    return filtered;
  }, [tasks, searchQuery, activeFilter, sortBy]);

  // Calculate task counts
  const taskCounts = useMemo(() => {
    const today = new Date().toDateString();
    return {
      all: tasks.length,
      dueToday: tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today).length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
    };
  }, [tasks]);

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, status: !task.completed ? 'completed' : 'todo' }
        : task
    ));
    
    const task = tasks.find(t => t.id === id);
    toast({
      title: task?.completed ? "Task marked as incomplete" : "Task completed!",
      description: task?.completed ? `"${task.title}" moved back to todo.` : `Great job completing "${task?.title}"!`,
    });
  };

  const handleCreateTask = (taskData: Omit<Task, 'id'>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
    };
    setTasks([newTask, ...tasks]);
    toast({
      title: "Task created successfully!",
      description: `"${newTask.title}" has been added to your task list.`,
    });
  };

  const handleEditTask = (taskData: Omit<Task, 'id'>) => {
    if (!editingTask) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { ...taskData, id: editingTask.id }
        : task
    ));
    setEditingTask(null);
    toast({
      title: "Task updated successfully!",
      description: `"${taskData.title}" has been updated.`,
    });
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task deleted",
      description: task ? `"${task.title}" has been removed.` : "Task has been removed.",
      variant: "destructive",
    });
  };

  const handleShareTask = (id: string) => {
    setSharingTaskId(id);
    setIsShareDialogOpen(true);
  };

  const handleUpdateSharedUsers = (emails: string[]) => {
    setTasks(tasks.map(task => 
      task.id === sharingTaskId 
        ? { ...task, sharedWith: emails }
        : task
    ));
    setSharingTaskId('');
  };

  const sharingTask = tasks.find(t => t.id === sharingTaskId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Stay organized and boost your productivity with AI-powered task management.
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{taskCounts.all}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{taskCounts.completed}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <div className="h-5 w-5 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{taskCounts.inProgress}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <div className="h-5 w-5 bg-blue-600 rounded-lg"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{taskCounts.overdue}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <div className="h-5 w-5 bg-red-600 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              
              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                taskCounts={taskCounts}
              />
            </div>
          </div>

          {/* Main Content - Tasks */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeFilter === 'all' ? 'All Tasks' : 
                   activeFilter === 'due-today' ? 'Due Today' :
                   activeFilter === 'overdue' ? 'Overdue Tasks' :
                   activeFilter === 'completed' ? 'Completed Tasks' :
                   activeFilter === 'in-progress' ? 'In Progress' : 'Tasks'}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
              
              <Button 
                onClick={() => setIsTaskFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Tasks Grid */}
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || activeFilter !== 'all'
                      ? 'Try adjusting your filters or search query.'
                      : 'Get started by creating your first task!'}
                  </p>
                  <Button 
                    onClick={() => setIsTaskFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={setEditingTask}
                    onDelete={handleDeleteTask}
                    onShare={handleShareTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen || !!editingTask}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />

      {/* Share Task Dialog */}
      <ShareTaskDialog
        isOpen={isShareDialogOpen}
        onClose={() => {
          setIsShareDialogOpen(false);
          setSharingTaskId('');
        }}
        taskTitle={sharingTask?.title || ''}
        currentShares={sharingTask?.sharedWith || []}
        onShare={handleUpdateSharedUsers}
      />
    </div>
  );
};

export default Dashboard;
