import { useState } from "react";
import { Plus, Search, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import TaskCard from "@/components/TaskCard";
import TaskFormDialog from "@/components/TaskFormDialog";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProgressOverview from "@/components/ProgressOverview";
import TeamProgress from "@/components/TeamProgress";
import AdminAttachments from "@/components/AdminAttachments";
import { Card, CardContent } from "@/components/ui/card";

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

export default function Dashboard() {
  const { tasks, profiles } = useApp();
  const { userRole, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const canCreateTask = userRole === "admin" || userRole === "manager";
  
  // Get user's own tasks for "My Tasks" section
  const myTasks = tasks.filter((task) => task.assigned_to === user?.id);

  const filteredTasks = tasks.filter((task) => {
    const assignedUser = profiles.find((p) => p.id === task.assigned_to);
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignedUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.deadline.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === "admin" && "Admin Dashboard"}
            {userRole === "manager" && "Manager Dashboard"}
            {userRole === "member" && "My Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userRole === "admin" && "Full system overview and team management"}
            {userRole === "manager" && "Track team progress and manage tasks"}
            {userRole === "member" && "View and manage your assigned tasks"}
          </p>
        </div>
        {canCreateTask && (
          <Button onClick={() => setIsTaskFormOpen(true)} className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Admin & Manager: Team Progress Overview */}
      {(userRole === "admin" || userRole === "manager") && (
        <>
          <TeamProgress />
          <ProgressOverview />
        </>
      )}

      {/* Admin Only: Attachments Viewer */}
      {userRole === "admin" && <AdminAttachments />}

      {/* Admin & Manager: My Tasks Section */}
      {(userRole === "admin" || userRole === "manager") && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            My Tasks
          </h2>
          {myTasks.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tasks assigned to you yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onEdit={() => handleEditTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Roles: Task Management Section */}
      <div className="space-y-4">
        {(userRole === "admin" || userRole === "manager") && (
          <h2 className="text-xl font-semibold">All Team Tasks</h2>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, assignee, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {tasks.length === 0 ? "No tasks yet" : "No tasks found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {tasks.length === 0
              ? "Start by creating your first task"
              : "Try adjusting your search or filters"}
          </p>
          {canCreateTask && tasks.length === 0 && (
            <Button onClick={() => setIsTaskFormOpen(true)} className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                onEdit={() => handleEditTask(task)}
              />
            ))}
          </div>
        )}
      </div>

      <TaskFormDialog
        open={isTaskFormOpen}
        onOpenChange={(open) => {
          setIsTaskFormOpen(open);
          if (!open) setSelectedTask(null);
        }}
        task={selectedTask}
      />

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
