-- 1. Make video-uploads bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'video-uploads';

-- 2. Drop the public SELECT policy that allows anyone to view files
DROP POLICY IF EXISTS "Public can view video-uploads" ON storage.objects;

-- 3. Create server-side credit check function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_and_deduct_credits(
  _user_id UUID,
  _credit_cost INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_credits INTEGER;
  _is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT has_role(_user_id, 'admin') INTO _is_admin;
  
  IF _is_admin THEN
    RETURN true; -- Admins don't consume credits
  END IF;
  
  -- Get current credits with row lock to prevent race conditions
  SELECT credits INTO _current_credits
  FROM profiles
  WHERE id = _user_id
  FOR UPDATE;
  
  IF _current_credits IS NULL THEN
    RETURN false; -- Profile not found
  END IF;
  
  IF _current_credits < _credit_cost THEN
    RETURN false; -- Insufficient credits
  END IF;
  
  -- Deduct credits
  UPDATE profiles
  SET credits = credits - _credit_cost, updated_at = now()
  WHERE id = _user_id;
  
  RETURN true;
END;
$$;