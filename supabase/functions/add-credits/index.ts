import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const AddCreditsSchema = z.object({
  credits: z.number().int().min(1).max(1000),
  planId: z.enum(['inicial', 'pro', 'free']),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // === AUTHENTICATION ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      logStep("Auth error", { error: claimsError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    logStep("User authenticated", { userId });

    // === INPUT VALIDATION ===
    const body = await req.json();
    const parseResult = AddCreditsSchema.safeParse(body);
    
    if (!parseResult.success) {
      logStep("Validation error", { errors: parseResult.error.errors });
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: parseResult.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { credits, planId } = parseResult.data;
    logStep("Credits to add", { credits, planId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current credits
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits, plan")
      .eq("id", userId)
      .single();

    if (profileError) {
      logStep("Profile error", { error: profileError.message });
      throw new Error(`Failed to get profile: ${profileError.message}`);
    }
    
    logStep("Current profile", { credits: profile.credits, plan: profile.plan });

    // Calculate new values with safety bounds
    const currentCredits = Math.max(0, profile.credits || 0);
    const newCredits = Math.min(currentCredits + credits, 10000); // Cap at 10000
    const newPlan = planId === "pro" ? "pro" : "inicial";

    // Update credits and plan
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ credits: newCredits, plan: newPlan, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      logStep("Update error", { error: updateError.message });
      throw new Error(`Failed to update credits: ${updateError.message}`);
    }
    
    logStep("Credits updated", { newCredits, newPlan });

    return new Response(JSON.stringify({ success: true, credits: newCredits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
