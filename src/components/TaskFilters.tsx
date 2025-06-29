
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, Clock, Star } from "lucide-react";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  taskCounts: {
    all: number;
    dueToday: number;
    overdue: number;
    completed: number;
    inProgress: number;
  };
}

const TaskFilters = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  taskCounts
}: TaskFiltersProps) => {
  const filters = [
    { id: 'all', label: 'All Tasks', count: taskCounts.all, icon: null },
    { id: 'due-today', label: 'Due Today', count: taskCounts.dueToday, icon: Calendar },
    { id: 'overdue', label: 'Overdue', count: taskCounts.overdue, icon: Clock },
    { id: 'in-progress', label: 'In Progress', count: taskCounts.inProgress, icon: Star },
    { id: 'completed', label: 'Completed', count: taskCounts.completed, icon: null },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center space-x-2 ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                  : "hover:bg-gray-50"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{filter.label}</span>
              <Badge 
                variant={isActive ? "secondary" : "outline"}
                className={`ml-1 ${
                  isActive 
                    ? "bg-white/20 text-white border-white/30" 
                    : "bg-gray-100"
                }`}
              >
                {filter.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
