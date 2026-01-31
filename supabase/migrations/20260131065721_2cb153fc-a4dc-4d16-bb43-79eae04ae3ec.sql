-- Fix the race condition in increment_usage by using atomic operations with row locking
CREATE OR REPLACE FUNCTION public.increment_usage(_user_id uuid, _type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_plan subscription_plan;
  max_count INTEGER;
  rows_updated INTEGER;
BEGIN
  -- Reset if needed
  PERFORM check_and_reset_usage(_user_id);
  
  -- Get user plan with row lock to prevent race conditions
  SELECT plan INTO user_plan
  FROM profiles 
  WHERE user_id = _user_id
  FOR UPDATE;
  
  -- Set limits based on plan
  IF user_plan = 'free' THEN
    max_count := 10;
  ELSE
    max_count := 999999; -- Unlimited for premium
  END IF;
  
  -- Atomic increment with conditional check in single UPDATE statement
  -- This prevents race conditions by combining check and update
  IF _type = 'mcq' THEN
    UPDATE profiles
    SET monthly_mcq_count = monthly_mcq_count + 1
    WHERE user_id = _user_id AND monthly_mcq_count < max_count;
  ELSIF _type = 'paper' THEN
    UPDATE profiles
    SET monthly_paper_count = monthly_paper_count + 1
    WHERE user_id = _user_id AND monthly_paper_count < max_count;
  ELSIF _type = 'voice' THEN
    UPDATE profiles
    SET monthly_voice_count = monthly_voice_count + 1
    WHERE user_id = _user_id AND monthly_voice_count < max_count;
  ELSE
    RETURN FALSE;
  END IF;
  
  -- Get the number of rows affected
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  -- If no rows updated, the limit was exceeded
  RETURN rows_updated > 0;
END;
$function$;