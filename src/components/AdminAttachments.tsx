import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useApp } from "@/contexts/AppContext";
import { Paperclip, Download, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function AdminAttachments() {
  const { tasks, profiles } = useApp();

  const tasksWithAttachments = tasks.filter((task) => task.attachment_url && task.status === "completed");

  const getAssigneeName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId);
    return profile?.name || "Unknown";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          All Task Attachments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasksWithAttachments.length === 0 ? (
          <div className="text-center py-8">
            <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No attachments uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasksWithAttachments.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getAssigneeName(task.assigned_to)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(task.attachment_url!, "_blank")}
                  className="ml-3"
                >
                  <Download className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
