import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus, Trash2, Users, Shield, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
  added_by: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

export default function AccessControl() {
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteEmailId, setDeleteEmailId] = useState<string | null>(null);
  const { user } = useAuth();
  const { profiles } = useApp();

  useEffect(() => {
    fetchAllowedEmails();
    fetchUserRoles();
  }, []);

  useEffect(() => {
    // Refetch roles when profiles change
    if (profiles.length > 0) {
      fetchUserRoles();
    }
  }, [profiles]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(ur => ur.user_id === userId)?.role;
    return role;
  };

  const getProfileByEmail = (email: string) => {
    return profiles.find(p => p.email?.toLowerCase() === email.toLowerCase());
  };

  const isAdminEmail = (email: string) => {
    const profile = getProfileByEmail(email);
    if (!profile) return false;
    return getUserRole(profile.id) === 'admin';
  };

  const fetchAllowedEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("allowed_emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllowedEmails(data || []);
    } catch (error) {
      console.error("Error fetching allowed emails:", error);
      toast.error("Failed to load allowed emails");
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("allowed_emails")
        .insert({ email: newEmail.toLowerCase(), added_by: user?.id });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already in the allowed list");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Email added successfully");
      setNewEmail("");
      fetchAllowedEmails();
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to add email");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!deleteEmailId) return;

    try {
      const { error } = await supabase
        .from("allowed_emails")
        .delete()
        .eq("id", deleteEmailId);

      if (error) throw error;

      toast.success("Email removed from allowed list");
      fetchAllowedEmails();
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to remove email");
    } finally {
      setDeleteEmailId(null);
    }
  };

  const activeUsers = profiles.filter(profile =>
    allowedEmails.some(ae => ae.email === profile.email)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Access Control
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage which email addresses can create accounts and access the system
        </p>
      </div>

      {/* Add New Email */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Allowed Email
          </CardTitle>
          <CardDescription>
            Only users with approved email addresses can sign up or sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEmail} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="new-email" className="sr-only">Email address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="hover-scale">
              <Mail className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Active Users ({activeUsers.length})
          </CardTitle>
          <CardDescription>
            Users who have successfully signed up and are currently active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active users yet
            </div>
          ) : (
            <div className="space-y-2">
              {activeUsers.map((profile) => {
                const role = getUserRole(profile.id);
                const roleConfig = {
                  admin: { 
                    label: 'Admin', 
                    icon: Crown, 
                    bgColor: 'bg-amber-500/10', 
                    textColor: 'text-amber-700',
                    iconColor: 'text-amber-500'
                  },
                  manager: { 
                    label: 'Manager', 
                    icon: Shield, 
                    bgColor: 'bg-blue-500/10', 
                    textColor: 'text-blue-700',
                    iconColor: 'text-blue-500'
                  },
                  member: { 
                    label: 'Member', 
                    icon: Users, 
                    bgColor: 'bg-primary/10', 
                    textColor: 'text-primary',
                    iconColor: 'text-primary'
                  }
                };
                const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
                const RoleIcon = config.icon;

                return (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                        <RoleIcon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{profile.name}</p>
                          <Badge variant="secondary" className={`${config.bgColor} ${config.textColor} hover:${config.bgColor}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500" title="Active" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowed Emails List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Allowed Email Addresses ({allowedEmails.length})
          </CardTitle>
          <CardDescription>
            Email addresses that are permitted to create accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allowedEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No allowed emails yet. Add an email address above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {allowedEmails.map((item) => {
                const isActive = activeUsers.some(u => u.email?.toLowerCase() === item.email.toLowerCase());
                const profile = getProfileByEmail(item.email);
                const role = profile ? getUserRole(profile.id) : null;
                
                const roleConfig = {
                  admin: { 
                    label: 'Admin', 
                    icon: Crown, 
                    bgColor: 'bg-amber-500/10', 
                    textColor: 'text-amber-700'
                  },
                  manager: { 
                    label: 'Manager', 
                    icon: Shield, 
                    bgColor: 'bg-blue-500/10', 
                    textColor: 'text-blue-700'
                  },
                  member: { 
                    label: 'Member', 
                    icon: Users, 
                    bgColor: 'bg-primary/10', 
                    textColor: 'text-primary'
                  }
                };
                const config = role ? roleConfig[role as keyof typeof roleConfig] : null;
                const RoleIcon = config?.icon || Mail;
                const iconColor = config ? (role === 'admin' ? 'text-amber-500' : role === 'manager' ? 'text-blue-500' : 'text-primary') : 'text-muted-foreground';

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <RoleIcon className={`h-4 w-4 ${iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{item.email}</p>
                          {config && (
                            <Badge variant="secondary" className={`${config.bgColor} ${config.textColor} hover:${config.bgColor} text-xs`}>
                              <RoleIcon className="h-2.5 w-2.5 mr-1" />
                              {config.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
                          Active
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteEmailId(item.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                        disabled={role === 'admin'}
                        title={role === 'admin' ? "Admin emails cannot be removed" : "Remove email"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmailId} onOpenChange={() => setDeleteEmailId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Email Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This email will no longer be able to sign up or sign in. Existing users with this email will not be affected, but they may lose access on next authentication attempt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmail} className="bg-destructive hover:bg-destructive/90">
              Remove Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
