import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import TaskCard from "@/components/TaskCard";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  deadline: string;
  status: string;
  priority: string;
  created_by: string;
  attachment_url?: string | null;
  completion_note?: string | null;
}

export default function MyTasks() {
  const { tasks } = useApp();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  const myTasks = tasks.filter((task) => task.assigned_to === user?.id);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const completedTasks = myTasks.filter((task) => task.status === "completed").length;
  const completionRate = myTasks.length > 0 
    ? Math.round((completedTasks / myTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">Tasks assigned to you</p>
      </div>

      {myTasks.length > 0 && (
        <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Progress</p>
                <p className="text-3xl font-bold mt-1">{completionRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedTasks} of {myTasks.length} tasks completed
                </p>
              </div>
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                <ClipboardList className="h-10 w-10 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {myTasks.length === 0 ? (
        <Card className="shadow-card animate-fade-in">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks assigned yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              You don't have any tasks assigned to you yet. Check back later or contact your manager.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {myTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onEdit={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      <TaskDetailsDialog
        open={isTaskDetailsOpen}
        onOpenChange={(open) => {
          setIsTaskDetailsOpen(open);
          if (!open) setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
