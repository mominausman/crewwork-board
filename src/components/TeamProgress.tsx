import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "./ui/progress";
import { CheckCircle2, Clock, PlayCircle, TrendingUp } from "lucide-react";

export default function TeamProgress() {
  const { tasks } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Team Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-status-pending" />
              <span className="text-xs font-medium text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingTasks}</p>
            <div className="h-1.5 bg-status-pending/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-status-pending rounded-full transition-all"
                style={{ width: totalTasks > 0 ? `${(pendingTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-status-progress" />
              <span className="text-xs font-medium text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{inProgressTasks}</p>
            <div className="h-1.5 bg-status-progress/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-status-progress rounded-full transition-all"
                style={{ width: totalTasks > 0 ? `${(inProgressTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-status-completed" />
              <span className="text-xs font-medium text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold">{completedTasks}</p>
            <div className="h-1.5 bg-status-completed/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-status-completed rounded-full transition-all"
                style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
