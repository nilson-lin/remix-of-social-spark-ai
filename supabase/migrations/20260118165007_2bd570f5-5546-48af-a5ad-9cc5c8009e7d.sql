-- Update the handle_new_user function to give only 1 free credit instead of 10
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, credits, plan)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 1, 'free');
  RETURN NEW;
END;
$function$;