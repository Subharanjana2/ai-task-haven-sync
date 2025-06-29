
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Share2, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onShare }: TaskCardProps) => {
  const priorityColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200"
  };

  const statusColors = {
    'todo': "bg-gray-100 text-gray-800",
    'in-progress': "bg-blue-100 text-blue-800",
    'completed': "bg-green-100 text-green-800"
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <Card className={cn(
      "group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
      task.completed && "opacity-75",
      isOverdue && "border-red-200 bg-red-50/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "text-lg leading-6",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(task.id)}
              className="h-8 w-8 p-0 hover:bg-blue-100"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status.replace('-', ' ')}
            </Badge>
          </div>
          
          {task.dueDate && (
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              isOverdue ? "text-red-600" : isDueToday ? "text-orange-600" : "text-muted-foreground"
            )}>
              {isOverdue ? <Clock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              <span>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {task.sharedWith && task.sharedWith.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Shared with {task.sharedWith.length} {task.sharedWith.length === 1 ? 'person' : 'people'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
