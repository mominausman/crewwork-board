import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, User, MessageSquare, Paperclip, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskCompletionDialog from "./TaskCompletionDialog";

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

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function TaskDetailsDialog({ open, onOpenChange, task }: TaskDetailsDialogProps) {
  const { comments, addComment, profiles } = useApp();
  const { user, userRole } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  if (!task) return null;

  const taskComments = comments.filter((c) => c.task_id === task.id);
  const assignedUser = profiles.find((u) => u.id === task.assigned_to);
  const canComplete = user?.id === task.assigned_to || userRole === "admin" || userRole === "manager";

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
    if (!newComment.trim() || !user) return;

    addComment({
      task_id: task.id,
      user_id: user.id,
      content: newComment.trim(),
    });

    setNewComment("");
  };

  const handleDownloadAttachment = () => {
    if (task.attachment_url) {
      window.open(task.attachment_url, "_blank");
    }
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
              <Badge className={cn("capitalize", statusColors[task.status as keyof typeof statusColors])}>
                {task.status.replace("-", " ")}
              </Badge>
              <Badge className={cn("capitalize", priorityColors[task.priority as keyof typeof priorityColors])}>
                {task.priority}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{task.description || "No description provided"}</p>
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

              {task.completion_note && (
                <div className="bg-status-completed/10 border border-status-completed/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Completion Note
                  </h4>
                  <p className="text-sm text-muted-foreground">{task.completion_note}</p>
                </div>
              )}

              {task.attachment_url && (
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Attachment</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAttachment}
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      View/Download
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {task.status !== "completed" && canComplete && (
              <Button onClick={() => setIsCompletionDialogOpen(true)} className="w-full">
                <Paperclip className="h-4 w-4 mr-2" />
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
                  taskComments.map((comment) => {
                    const commentUser = profiles.find((p) => p.id === comment.user_id);
                    return (
                      <div key={comment.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{commentUser?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      {task && (
        <TaskCompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={setIsCompletionDialogOpen}
          taskId={task.id}
          taskTitle={task.title}
        />
      )}
    </Dialog>
  );
}
