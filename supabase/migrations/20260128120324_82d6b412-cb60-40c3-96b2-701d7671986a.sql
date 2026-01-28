-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'monthly', 'lifetime');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan subscription_plan DEFAULT 'free' NOT NULL,
  monthly_mcq_count INTEGER DEFAULT 0,
  monthly_paper_count INTEGER DEFAULT 0,
  monthly_voice_count INTEGER DEFAULT 0,
  last_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create subscriptions table for payment tracking
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create saved_mcqs table
CREATE TABLE public.saved_mcqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT NOT NULL,
  questions JSONB NOT NULL,
  question_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.saved_mcqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MCQs"
  ON public.saved_mcqs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCQs"
  ON public.saved_mcqs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCQs"
  ON public.saved_mcqs FOR DELETE
  USING (auth.uid() = user_id);

-- Create saved_papers table
CREATE TABLE public.saved_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  institution_name TEXT,
  questions JSONB NOT NULL,
  answer_key JSONB,
  total_marks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.saved_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own papers"
  ON public.saved_papers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own papers"
  ON public.saved_papers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own papers"
  ON public.saved_papers FOR DELETE
  USING (auth.uid() = user_id);

-- Create saved_notes table for voice-to-notes
CREATE TABLE public.saved_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  summary TEXT,
  generated_mcqs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
  ON public.saved_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.saved_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.saved_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.saved_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check and reset monthly usage
CREATE OR REPLACE FUNCTION public.check_and_reset_usage(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
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
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(_user_id UUID, _type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan subscription_plan;
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  -- Reset if needed
  PERFORM check_and_reset_usage(_user_id);
  
  -- Get user plan and current count
  SELECT plan,
    CASE _type
      WHEN 'mcq' THEN monthly_mcq_count
      WHEN 'paper' THEN monthly_paper_count
      WHEN 'voice' THEN monthly_voice_count
    END
  INTO user_plan, current_count
  FROM profiles WHERE user_id = _user_id;
  
  -- Set limits based on plan
  IF user_plan = 'free' THEN
    max_count := 10;
  ELSE
    max_count := 999999; -- Unlimited for premium
  END IF;
  
  -- Check limit
  IF current_count >= max_count THEN
    RETURN FALSE;
  END IF;
  
  -- Increment count
  UPDATE profiles
  SET 
    monthly_mcq_count = CASE WHEN _type = 'mcq' THEN monthly_mcq_count + 1 ELSE monthly_mcq_count END,
    monthly_paper_count = CASE WHEN _type = 'paper' THEN monthly_paper_count + 1 ELSE monthly_paper_count END,
    monthly_voice_count = CASE WHEN _type = 'voice' THEN monthly_voice_count + 1 ELSE monthly_voice_count END
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;