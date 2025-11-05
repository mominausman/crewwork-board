import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Task, Comment, Notification, UserRole } from "@/types";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
  login: (role: UserRole, name: string) => void;
  logout: () => void;
  addUser: (user: Omit<User, "id">) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedUsers = localStorage.getItem("users");
    const savedTasks = localStorage.getItem("tasks");
    const savedComments = localStorage.getItem("comments");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const login = (role: UserRole, name: string) => {
    const existingUser = users.find((u) => u.name === name && u.role === role);
    if (existingUser) {
      setCurrentUser(existingUser);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email: `${name.toLowerCase().replace(/\s/g, ".")}@company.com`,
        role,
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const addUser = (user: Omit<User, "id">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    setUsers([...users, newUser]);
  };

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    
    // Create notification
    const assignedUser = users.find((u) => u.id === task.assignedTo);
    addNotification({
      message: `New task "${task.title}" assigned to ${assignedUser?.name || "you"}`,
      type: "task-created",
    });
  };

  const updateTask = (id: string, taskUpdate: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, ...taskUpdate, updatedAt: new Date().toISOString() }
          : task
      )
    );
    
    // Create notification for status changes
    if (taskUpdate.status === "completed") {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        addNotification({
          message: `Task "${task.title}" has been completed`,
          type: "task-completed",
        });
      }
    } else if (taskUpdate.status || taskUpdate.assignedTo) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        addNotification({
          message: `Task "${task.title}" has been updated`,
          type: "task-updated",
        });
      }
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setComments(comments.filter((comment) => comment.taskId !== id));
  };

  const addComment = (comment: Omit<Comment, "id" | "createdAt">) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        comments,
        notifications,
        login,
        logout,
        addUser,
        addTask,
        updateTask,
        deleteTask,
        addComment,
        addNotification,
        markNotificationAsRead,
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
