-- Fix user_roles visibility issue
-- Drop the overly permissive policy that allows all users to see all roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Users can only see their own role
CREATE POLICY "Users can view own role"
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Admins can see all roles (needed for user management)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));