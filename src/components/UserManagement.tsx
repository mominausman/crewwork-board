import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, Users, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import RoleBadge from "@/components/RoleBadge";
import { signUpSchema, profileUpdateSchema } from "@/lib/validationSchemas";
import { z } from "zod";

interface UserRole {
  user_id: string;
  role: string;
}

export default function UserManagement() {
  const { profiles, refreshData } = useApp();
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member" as "admin" | "manager" | "member",
  });
  
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "member" as "admin" | "manager" | "member",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserRoles();
  }, [profiles]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (error) throw error;
      
      const rolesMap: Record<string, string> = {};
      (data as UserRole[]).forEach((ur) => {
        rolesMap[ur.user_id] = ur.role;
      });
      setUserRoles(rolesMap);
    } catch (error: any) {
      console.error("Error fetching user roles:", error);
      toast.error("Failed to load user roles");
    }
  };

  const validateNewUser = () => {
    try {
      signUpSchema.parse(newUserData);
      setFormErrors({});
      return true;
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
      return false;
    }
  };

  const validateEditUser = () => {
    try {
      profileUpdateSchema.parse({
        name: editUserData.name,
        email: editUserData.email,
      });
      setFormErrors({});
      return true;
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
      return false;
    }
  };

  const handleCreateUser = async () => {
    if (!validateNewUser()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email.trim(),
        password: newUserData.password,
        options: {
          data: {
            name: newUserData.name.trim(),
            role: newUserData.role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      
      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      setNewUserData({ name: "", email: "", password: "", role: "member" });
      setFormErrors({});
      
      // Refresh data after a short delay to allow backend processing
      setTimeout(() => {
        refreshData();
        fetchUserRoles();
      }, 1000);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUserId) return;
    if (!validateEditUser()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: editUserData.name.trim(),
          email: editUserData.email.trim(),
        })
        .eq("id", editUserId);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: editUserData.role })
        .eq("user_id", editUserId);

      if (roleError) throw roleError;

      toast.success("User updated successfully");
      setEditUserId(null);
      setFormErrors({});
      refreshData();
      fetchUserRoles();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setLoading(true);
    try {
      // Delete user (cascade will handle profile and role deletion)
      const { error } = await supabase.auth.admin.deleteUser(deleteUserId);

      if (error) throw error;

      toast.success("User deleted successfully");
      setDeleteUserId(null);
      refreshData();
      fetchUserRoles();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user. You may need to delete from the backend.");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (userId: string) => {
    const user = profiles.find((p) => p.id === userId);
    if (user) {
      setEditUserData({
        name: user.name,
        email: user.email,
        role: (userRoles[userId] || "member") as any,
      });
      setEditUserId(userId);
      setFormErrors({});
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-role-admin/20">
        <CardHeader className="bg-gradient-to-r from-role-admin/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-role-admin/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-role-admin" />
              </div>
              <div>
                <CardTitle className="text-2xl">User Management</CardTitle>
                <CardDescription>Create, edit, and manage user accounts and roles</CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="hover-scale">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>All Users ({filteredProfiles.length})</CardTitle>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const role = userRoles[profile.id] || "member";
              return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{profile.name}</h3>
                            <RoleBadge role={role as any} />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(profile.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUserId(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account with email and password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full Name *</Label>
              <Input
                id="new-name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="John Doe"
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="john@example.com"
              />
              {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
              {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role *</Label>
              <Select
                value={newUserData.role}
                onValueChange={(v: any) => setNewUserData({ ...newUserData, role: v })}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Team Member</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-sm text-destructive">{formErrors.role}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormErrors({});
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUserId} onOpenChange={(open) => !open && setEditUserId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
              />
              {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={editUserData.role}
                onValueChange={(v: any) => setEditUserData({ ...editUserData, role: v })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditUserId(null);
                  setFormErrors({});
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={loading}>
                {loading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
