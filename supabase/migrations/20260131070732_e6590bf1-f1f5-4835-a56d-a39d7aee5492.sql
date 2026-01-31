-- Add DELETE policy for profiles table to allow GDPR-compliant data deletion
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);