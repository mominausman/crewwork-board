import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { UserRole } from "@/types";
import { CheckSquare } from "lucide-react";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { login } = useApp();

  const handleLogin = () => {
    if (name.trim()) {
      login(selectedRole, name.trim());
      navigate("/dashboard");
    }
  };

  const roles = [
    {
      value: "admin" as UserRole,
      title: "Admin",
      description: "Full access to manage users and tasks",
    },
    {
      value: "manager" as UserRole,
      title: "Manager",
      description: "Create, assign, and manage team tasks",
    },
    {
      value: "member" as UserRole,
      title: "Team Member",
      description: "View and complete assigned tasks",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <CheckSquare className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Team Task Manager</CardTitle>
          <CardDescription>Choose your role to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="space-y-3">
            <Label>Select Role</Label>
            <div className="grid gap-3">
              {roles.map((role) => (
                <Card
                  key={role.value}
                  className={`cursor-pointer transition-all ${
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        selectedRole === role.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedRole === role.value && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{role.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleLogin} disabled={!name.trim()}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
