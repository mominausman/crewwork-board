import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import TaskCard from "@/components/TaskCard";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function MyTasks() {
  const { tasks, currentUser } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  const myTasks = tasks.filter((task) => task.assignedTo === currentUser?.id);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">Tasks assigned to you</p>
      </div>

      {myTasks.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              You don't have any tasks assigned to you yet. Check back later or contact your manager.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
