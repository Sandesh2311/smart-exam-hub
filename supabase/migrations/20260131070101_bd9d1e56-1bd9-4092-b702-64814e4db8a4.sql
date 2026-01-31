-- Fix check_and_reset_usage to add authorization check
-- This function should only be callable for the authenticated user's own profile
CREATE OR REPLACE FUNCTION public.check_and_reset_usage(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Security check: Ensure caller can only reset their own usage
  -- When called from increment_usage (which validates auth), this provides defense in depth
  IF auth.uid() IS NOT NULL AND _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot reset usage for other users';
  END IF;
  
  SELECT last_usage_reset INTO last_reset FROM profiles WHERE user_id = _user_id;
  
  IF last_reset IS NULL OR last_reset < date_trunc('month', now()) THEN
    UPDATE profiles 
    SET monthly_mcq_count = 0, 
        monthly_paper_count = 0, 
        monthly_voice_count = 0,
        last_usage_reset = now()
    WHERE user_id = _user_id;
  END IF;
END;
$function$;

-- Revoke direct RPC access to prevent external calls
REVOKE EXECUTE ON FUNCTION public.check_and_reset_usage(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.check_and_reset_usage(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_and_reset_usage(uuid) FROM authenticated;