import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { credits, planId } = await req.json();
    logStep("Credits to add", { credits, planId });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data } = await supabaseAnon.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get current credits
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`);
    logStep("Current profile", { credits: profile.credits, plan: profile.plan });

    const newCredits = (profile.credits || 0) + credits;
    const newPlan = planId === "pro" ? "pro" : "inicial";

    // Update credits and plan
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ credits: newCredits, plan: newPlan })
      .eq("id", user.id);

    if (updateError) throw new Error(`Failed to update credits: ${updateError.message}`);
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
