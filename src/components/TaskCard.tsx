import { Calendar, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Task } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onEdit: () => void;
}

export default function TaskCard({ task, onClick, onEdit }: TaskCardProps) {
  const { currentUser, deleteTask, users } = useApp();

  const canEdit = currentUser?.role === "admin" || currentUser?.role === "manager";
  const assignedUser = users.find((u) => u.id === task.assignedTo);

  const statusColors = {
    pending: "bg-status-pending text-white",
    "in-progress": "bg-status-progress text-white",
    completed: "bg-status-completed text-white",
  };

  const priorityColors = {
    high: "bg-priority-high text-white",
    medium: "bg-priority-medium text-white",
    low: "bg-priority-low text-white",
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer group shadow-card"
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleEdit}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>

        <div className="flex gap-2">
          <Badge className={cn("capitalize", statusColors[task.status])}>
            {task.status.replace("-", " ")}
          </Badge>
          <Badge className={cn("capitalize", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          <span>{assignedUser?.name || "Unassigned"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(task.deadline), "MMM dd, yyyy")}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
