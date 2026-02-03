-- Lock down credits RPC so only backend functions (service role) can execute it
REVOKE ALL ON FUNCTION public.check_and_deduct_credits(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_deduct_credits(uuid, integer) TO service_role;