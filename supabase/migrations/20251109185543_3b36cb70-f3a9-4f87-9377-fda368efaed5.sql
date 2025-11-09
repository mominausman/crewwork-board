-- Drop existing function
DROP FUNCTION IF EXISTS public.is_email_allowed(text);

-- Create updated function that always allows admin emails
CREATE OR REPLACE FUNCTION public.is_email_allowed(user_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_email boolean;
BEGIN
  -- Check if this email belongs to an admin user
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    INNER JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE u.email = user_email
    AND ur.role = 'admin'
  ) INTO is_admin_email;
  
  -- If it's an admin email, always allow
  IF is_admin_email THEN
    RETURN true;
  END IF;
  
  -- Otherwise, check if email is in allowed list
  RETURN EXISTS (
    SELECT 1
    FROM public.allowed_emails
    WHERE email = user_email
  );
END;
$$;

-- Create trigger function to auto-add admin emails to allowed list
CREATE OR REPLACE FUNCTION public.auto_add_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the new user role is admin, add their email to allowed_emails
  IF NEW.role = 'admin' THEN
    INSERT INTO public.allowed_emails (email, added_by)
    SELECT u.email, NEW.user_id
    FROM auth.users u
    WHERE u.id = NEW.user_id
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS auto_add_admin_email_trigger ON public.user_roles;
CREATE TRIGGER auto_add_admin_email_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_add_admin_email();