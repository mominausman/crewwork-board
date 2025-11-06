import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import RoleBadge from "@/components/RoleBadge";

export default function Team() {
  const { profiles, tasks } = useApp();
  const { userRole } = useAuth();
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUserRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (!error && data) {
        const rolesMap = data.reduce((acc, item) => {
          acc[item.user_id] = item.role;
          return acc;
        }, {} as Record<string, string>);
        setUserRoles(rolesMap);
      }
    };

    fetchUserRoles();
  }, []);

  const getUserTaskCount = (userId: string) => {
    return tasks.filter((task) => task.assigned_to === userId).length;
  };

  // Check if user has permission to view team
  if (userRole === "member") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="shadow-card max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              You don't have access to view team details. Please contact your manager or admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            const role = userRoles[profile.id] || "member";
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
                    <RoleBadge role={role} />
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
