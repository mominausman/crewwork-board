import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Task } from "@/types";
import { useApp } from "@/contexts/AppContext";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, User, MessageSquare, Paperclip, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function TaskDetailsDialog({ open, onOpenChange, task }: TaskDetailsDialogProps) {
  const { comments, addComment, currentUser, users, updateTask } = useApp();
  const [newComment, setNewComment] = useState("");

  if (!task) return null;

  const taskComments = comments.filter((c) => c.taskId === task.id);
  const assignedUser = users.find((u) => u.id === task.assignedTo);
  const canComplete = currentUser?.id === task.assignedTo || currentUser?.role === "admin" || currentUser?.role === "manager";

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    addComment({
      taskId: task.id,
      userId: currentUser?.id || "",
      userName: currentUser?.name || "",
      content: newComment.trim(),
    });

    setNewComment("");
    toast.success("Comment added");
  };

  const handleMarkComplete = () => {
    updateTask(task.id, { status: "completed" });
    toast.success("Task marked as completed");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-6 pr-4">
            <div className="flex gap-2">
              <Badge className={cn("capitalize", statusColors[task.status])}>
                {task.status.replace("-", " ")}
              </Badge>
              <Badge className={cn("capitalize", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="font-medium">{assignedUser?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium">{format(new Date(task.deadline), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>

            {task.status !== "completed" && canComplete && (
              <Button onClick={handleMarkComplete} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h4 className="font-semibold">Comments</h4>
                <span className="text-sm text-muted-foreground">({taskComments.length})</span>
              </div>

              <div className="space-y-3">
                {taskComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  taskComments.map((comment) => (
                    <div key={comment.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File (Coming Soon)
                  </Button>
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
