import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CheckSquare } from "lucide-react";
import { UserRole } from "@/types";
import { signInSchema, signUpSchema } from "@/lib/validationSchemas";
import { z } from "zod";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signInSchema.parse({ email, password });
      setFormErrors({});
      
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signUpSchema.parse({ name, email, password, role: selectedRole });
      setFormErrors({});
      
      const { error } = await signUp(email, password, name, selectedRole);
      if (!error) {
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-card/95 relative z-10">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-fade-in hover:scale-110 transition-transform duration-300">
              <CheckSquare className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight">Team Task Manager</CardTitle>
          <CardDescription className="text-base">
            {isSignUp ? "Create your account to get started" : "Welcome back! Sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-11">
              <TabsTrigger value="signin" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-200"
                    required
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-200"
                    required
                  />
                  {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
                </div>
                <Button type="submit" className="w-full h-11 font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-200"
                    required
                  />
                  {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-200"
                    required
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-200"
                    required
                    minLength={6}
                  />
                  {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Role</Label>
                  <div className="grid gap-2.5">
                    {roles.map((role) => (
                      <Card
                        key={role.value}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          selectedRole === role.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/50 hover:border-primary/50 bg-background/50"
                        }`}
                        onClick={() => setSelectedRole(role.value)}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                              selectedRole === role.value
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/50"
                            }`}
                          >
                            {selectedRole === role.value && (
                              <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-0.5">{role.title}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {role.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
