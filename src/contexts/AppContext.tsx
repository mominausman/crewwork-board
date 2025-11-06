import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  deadline: string;
  status: string;
  priority: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  attachment_url?: string | null;
  completion_note?: string | null;
}

interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface AppContextType {
  profiles: Profile[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (comment: Omit<Comment, "id" | "created_at">) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const refreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*");
      if (profilesData) setProfiles(profilesData);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (tasksData) setTasks(tasksData);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (commentsData) setComments(commentsData);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (notificationsData) setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setProfiles([]);
      setTasks([]);
      setComments([]);
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    // Subscribe to comments changes
    const commentsChannel = supabase
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  const addTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("tasks").insert([{
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        deadline: task.deadline,
        status: task.status as any,
        priority: task.priority as any,
        created_by: task.created_by,
      }]);

      if (error) throw error;

      // Create notification for assigned user
      const assignedProfile = profiles.find((p) => p.id === task.assigned_to);
      if (assignedProfile) {
        await supabase.from("notifications").insert([
          {
            user_id: task.assigned_to,
            message: `New task "${task.title}" assigned to you`,
            type: "task-created",
          },
        ]);
      }

      toast.success("Task created successfully");
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task");
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assigned_to) updateData.assigned_to = updates.assigned_to;
      if (updates.deadline) updateData.deadline = updates.deadline;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Create notification for status change
      if (updates.status === "completed") {
        const task = tasks.find((t) => t.id === id);
        if (task) {
          await supabase.from("notifications").insert([
            {
              user_id: task.created_by,
              message: `Task "${task.title}" has been completed`,
              type: "task-completed",
            },
          ]);
        }
      }

      toast.success("Task updated successfully");
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(error.message || "Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      toast.success("Task deleted successfully");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
    }
  };

  const addComment = async (comment: Omit<Comment, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("comments").insert([comment]);

      if (error) throw error;

      toast.success("Comment added");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.message || "Failed to add comment");
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        tasks,
        comments,
        notifications,
        loading,
        addTask,
        updateTask,
        deleteTask,
        addComment,
        markNotificationAsRead,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
