import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Mail } from "lucide-react";

export default function Team() {
  const { profiles, tasks } = useApp();

  const getUserTaskCount = (userId: string) => {
    return tasks.filter((task) => task.assigned_to === userId).length;
  };

  // Get role for each user
  const getUserRole = (userId: string) => {
    // This would need to be fetched from user_roles table
    // For now, returning a placeholder
    return "member";
  };

  const roleColors = {
    admin: "bg-destructive text-destructive-foreground",
    manager: "bg-primary text-primary-foreground",
    member: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground mt-1">
          View all team members and their roles
        </p>
      </div>

      {profiles.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Team members will appear here as they join the platform
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const role = getUserRole(profile.id);
            return (
              <Card key={profile.id} className="shadow-card hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{profile.email}</span>
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{profile.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge className={roleColors[role as keyof typeof roleColors]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getUserTaskCount(profile.id)} tasks
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
