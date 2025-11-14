-- Fix RLS Policies for User Management
-- Date: 2025-11-14
-- Purpose: Allow users to see their own roles while maintaining admin-only modification

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Create new policies that allow users to see their own roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Keep admin-only modification policies (already exist, but ensure they're there)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles" 
  ON public.user_roles FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles" 
  ON public.user_roles FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Add policy to allow profiles deletion by admins
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Add comment for documentation
COMMENT ON POLICY "Users can view their own roles" ON public.user_roles IS 
  'Allows authenticated users to view their own roles for authorization checks';
COMMENT ON POLICY "Admins can view all roles" ON public.user_roles IS 
  'Allows admin users to view all user roles for management purposes';
