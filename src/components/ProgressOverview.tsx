import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useApp } from "@/contexts/AppContext";

export default function ProgressOverview() {
  const { tasks } = useApp();

  const stats = [
    {
      label: "Pending",
      value: tasks.filter((t) => t.status === "pending").length,
      icon: Clock,
      colorClass: "text-status-pending",
      bgClass: "bg-status-pending/10",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: PlayCircle,
      colorClass: "text-status-progress",
      bgClass: "bg-status-progress/10",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "completed").length,
      icon: CheckCircle2,
      colorClass: "text-status-completed",
      bgClass: "bg-status-completed/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.bgClass} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.colorClass}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
