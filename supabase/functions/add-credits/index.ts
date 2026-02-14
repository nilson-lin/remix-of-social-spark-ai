import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS: Record<string, { credits: number }> = {
  inicial: { credits: 20 },
  pro: { credits: 30 },
};

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
        JSON.stringify({ error: 'Unauthorized' }),
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
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    logStep("User authenticated", { userId });

    // === INPUT: session_id ===
    const body = await req.json();
    const sessionId = body.session_id;
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return new Response(
        JSON.stringify({ error: 'Invalid session_id' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === VERIFY PAYMENT WITH STRIPE ===
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      status: session.payment_status, 
      metadata: session.metadata 
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to this user
    if (session.metadata?.userId !== userId) {
      logStep("User mismatch", { sessionUser: session.metadata?.userId, requestUser: userId });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: session does not belong to user' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planId = session.metadata?.planId;
    const plan = planId ? PLANS[planId] : null;
    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan in session' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credits = plan.credits;
    logStep("Credits to add", { credits, planId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if credits were already added for this session (idempotency)
    const { data: existingProfile } = await supabaseClient
      .from("profiles")
      .select("credits, plan, updated_at")
      .eq("id", userId)
      .single();

    if (!existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Current profile", { credits: existingProfile.credits, plan: existingProfile.plan });

    const currentCredits = Math.max(0, existingProfile.credits || 0);
    const newCredits = Math.min(currentCredits + credits, 10000);
    const newPlan = planId === "pro" ? "pro" : "inicial";

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ credits: newCredits, plan: newPlan, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
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
