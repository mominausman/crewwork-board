-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', false);

-- Add attachment fields to tasks table
ALTER TABLE public.tasks
ADD COLUMN attachment_url text,
ADD COLUMN completion_note text;

-- Create RLS policies for task-attachments bucket
CREATE POLICY "Users can view attachments for tasks they can see"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-attachments' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id::text = (storage.foldername(name))[1]
      AND tasks.assigned_to = auth.uid()
    )
  )
);

CREATE POLICY "Assigned users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-attachments' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id::text = (storage.foldername(name))[1]
    AND tasks.assigned_to = auth.uid()
  )
);

CREATE POLICY "Assigned users can update their attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'task-attachments' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id::text = (storage.foldername(name))[1]
    AND tasks.assigned_to = auth.uid()
  )
);

CREATE POLICY "Admins and managers can delete attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-attachments' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);