import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";
import { handleError } from "@/lib/errorHandler";

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
}

export default function TaskCompletionDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
}: TaskCompletionDialogProps) {
  const { updateTask } = useApp();
  const { userRole } = useAuth();
  const [completionNote, setCompletionNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const isTeamMember = userRole === "member";
  const requiresAttachment = isTeamMember;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (selectedFile.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Only PDF, images, and Word documents are allowed");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleComplete = async () => {
    if (requiresAttachment && !file) {
      toast.error("Attachment required", {
        description: "Team members must upload a file to complete a task.",
      });
      return;
    }

    setUploading(true);

    try {
      let attachmentUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${taskId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("task-attachments")
          .getPublicUrl(fileName);

        attachmentUrl = urlData.publicUrl;
      }

      await updateTask(taskId, {
        status: "completed",
        completion_note: completionNote.trim() || null,
        attachment_url: attachmentUrl,
      });

      toast.success("Task marked as completed with attachment successfully");
      onOpenChange(false);
      setCompletionNote("");
      setFile(null);
    } catch (error) {
      handleError(error, "Failed to complete task. Please try again.", "Complete task");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-status-completed" />
            Complete Task
          </DialogTitle>
          <DialogDescription>
            {requiresAttachment 
              ? "Please add completion notes and upload a file to mark this task as complete."
              : "Add optional notes and attachments for this completed task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {requiresAttachment && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Attachment is required for team members to complete tasks.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-muted-foreground">
            You're about to mark <span className="font-semibold">{taskTitle}</span> as completed.
          </p>

          <div className="space-y-2">
            <Label htmlFor="completion-note">
              Completion Note (Optional)
            </Label>
            <Textarea
              id="completion-note"
              placeholder="Add any final notes or comments about this task..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">
              Attach File {requiresAttachment ? <span className="text-destructive">*</span> : "(Optional)"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="cursor-pointer"
              />
              {file && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {file && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Upload className="h-3 w-3" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, Images (JPG, PNG), Word documents. Max size: 10MB
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={uploading || (requiresAttachment && !file)}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Completion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
