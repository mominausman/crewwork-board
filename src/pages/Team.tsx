import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { User, Mail } from "lucide-react";

export default function Team() {
  const { users, tasks } = useApp();

  const getUserTaskCount = (userId: string) => {
    return tasks.filter((task) => task.assignedTo === userId).length;
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

      {users.length === 0 ? (
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
          {users.map((user) => (
            <Card key={user.id} className="shadow-card hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge className={roleColors[user.role]}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getUserTaskCount(user.id)} tasks
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
