-- Fix critical RLS policy vulnerabilities

-- 1. Fix profiles table - restrict email visibility to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Fix notifications table - remove unrestricted INSERT policy
-- Only service role (server-side) can create notifications now
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Note: Notification creation should now be handled server-side only
-- Client-side code will need to be updated to use edge functions or
-- the application will need to implement proper validation logic