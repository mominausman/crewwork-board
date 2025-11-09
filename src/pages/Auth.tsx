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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015]" />
      
      {/* Floating orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <Card className="w-full max-w-[440px] shadow-2xl border backdrop-blur-sm bg-card/98 relative z-10 animate-fade-in">
        <CardHeader className="text-center space-y-6 pb-8 pt-10">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
              <CheckSquare className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Team Task Manager</CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              {isSignUp ? "Create your account to get started" : "Welcome back! Sign in to continue"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(v) => setIsSignUp(v === "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 h-12 mb-8">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                    required
                  />
                  {formErrors.email && <p className="text-sm text-destructive font-medium">{formErrors.email}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                    required
                  />
                  {formErrors.password && <p className="text-sm text-destructive font-medium">{formErrors.password}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-base"
                >
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                    Full name
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-background border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                    required
                  />
                  {formErrors.name && <p className="text-sm text-destructive font-medium">{formErrors.name}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                    required
                  />
                  {formErrors.email && <p className="text-sm text-destructive font-medium">{formErrors.email}</p>}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-background border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-base"
                    required
                    minLength={6}
                  />
                  {formErrors.password && <p className="text-sm text-destructive font-medium">{formErrors.password}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Select your role</Label>
                  <div className="grid gap-3">
                    {roles.map((role) => (
                      <Card
                        key={role.value}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
                          selectedRole === role.value
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border/40 hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedRole(role.value)}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all duration-200 shrink-0 ${
                              selectedRole === role.value
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {selectedRole === role.value && (
                              <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{role.title}</h4>
                            <p className="text-xs text-muted-foreground/90 leading-relaxed">
                              {role.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-base"
                >
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
