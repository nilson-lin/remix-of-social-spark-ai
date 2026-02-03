import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLLO_API_URL = "https://pollo.ai/api/platform/generation/google/veo3-fast";

// Input validation schema
const VideoInputSchema = z.object({
  videoId: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional().default(''),
  sourceImages: z.array(z.string().url()).min(1).max(3),
  platform: z.enum(['reels', 'tiktok', 'youtube_shorts', 'feed', 'landscape']).optional().default('reels'),
  style: z.enum(['cinematic', 'energetic', 'calm', 'professional', 'playful', 'dramatic']).optional().default('cinematic'),
  duration: z.enum(['4', '6', '8']).optional().default('8').transform(val => parseInt(val, 10)),
  aspectRatio: z.string().optional(),
});

// Sanitize text for prompts
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 500);
}

// Build video prompt based on style and content
function buildVideoPrompt(title: string, description: string, style: string): string {
  const styleDescriptions: Record<string, string> = {
    cinematic: "Cinematic video with dramatic lighting, smooth camera movements, film-like color grading, and professional Hollywood-style composition.",
    energetic: "Dynamic and vibrant video with fast-paced energy, saturated colors, quick transitions, and exciting movement.",
    calm: "Peaceful and zen-like video with slow, gentle movements, soft pastel colors, smooth transitions, and meditative atmosphere.",
    professional: "Clean and polished corporate video with sleek modern aesthetics, professional lighting, and sophisticated business-appropriate style.",
    playful: "Fun and engaging video with bright cheerful colors, bouncy movements, playful animations, and joyful atmosphere.",
    dramatic: "Epic and impactful video with high contrast, moody lighting, intense movements, and blockbuster movie style visuals.",
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.cinematic;
  const sanitizedTitle = sanitizeForPrompt(title);
  const sanitizedDesc = description ? sanitizeForPrompt(description) : '';
  
  return `Create a stunning social media video for: "${sanitizedTitle}". ${sanitizedDesc ? `Context: ${sanitizedDesc}.` : ''} Style: ${styleDesc}. Make it scroll-stopping, visually captivating, and perfect for social media engagement.`;
}

// Get aspect ratio config based on platform
function getAspectRatioConfig(platform: string): { aspectRatio: string; resolution: string } {
  const configs: Record<string, { aspectRatio: string; resolution: string }> = {
    reels: { aspectRatio: "9:16", resolution: "720p" },
    tiktok: { aspectRatio: "9:16", resolution: "720p" },
    youtube_shorts: { aspectRatio: "9:16", resolution: "720p" },
    feed: { aspectRatio: "1:1", resolution: "720p" },
    landscape: { aspectRatio: "16:9", resolution: "720p" },
  };
  
  return configs[platform] || configs.reels;
}

// Poll for video generation status
async function pollForCompletion(
  generationId: string,
  apiKey: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<{ videoUrl: string; thumbnailUrl?: string } | null> {
  console.log(`Polling for generation ${generationId}...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://pollo.ai/api/platform/generation/${generationId}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Poll attempt ${attempt + 1} failed:`, response.status);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      const result = await response.json();
      console.log(`Poll attempt ${attempt + 1}, status:`, result.status);

      if (result.status === "completed" && result.output?.videoUrl) {
        return {
          videoUrl: result.output.videoUrl,
          thumbnailUrl: result.output.thumbnailUrl || result.output.videoUrl,
        };
      }

      if (result.status === "failed") {
        console.error("Video generation failed:", result.error);
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Poll attempt ${attempt + 1} error:`, error);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.error("Polling timed out");
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestVideoId: string | undefined;

  try {
    // === AUTHENTICATION ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // === INPUT VALIDATION ===
    const body = await req.json();
    const parseResult = VideoInputSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: parseResult.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { videoId, title, description, sourceImages, platform, style, duration } = parseResult.data;
    requestVideoId = videoId;

    console.log("Generate video request:", { videoId, title, platform, style });

    const POLLO_API_KEY = Deno.env.get("POLLO_API_KEY");
    if (!POLLO_API_KEY) {
      throw new Error("POLLO_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // === VERIFY VIDEO OWNERSHIP ===
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (video.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not own this video' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === CHECK AND DEDUCT CREDITS (Server-side) ===
    const { data: hasCredits, error: creditError } = await supabase
      .rpc('check_and_deduct_credits', {
        _user_id: userId,
        _credit_cost: 2
      });

    if (creditError) {
      console.error("Credit check error:", creditError);
      throw new Error("Failed to verify credits");
    }

    if (!hasCredits) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits. Video generation requires 2 credits.' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Credits verified and deducted (2 credits)");

    // Build prompt for video generation
    const prompt = buildVideoPrompt(title, description ?? "", style || "cinematic");
    const { aspectRatio, resolution } = getAspectRatioConfig(platform ?? "reels");
    
    console.log("Video prompt:", prompt);
    console.log("Aspect ratio:", aspectRatio, "Resolution:", resolution);

    // Use the first image as the source for image-to-video
    const sourceImage = sourceImages[0];

    // Call Pollo.ai Veo3 API
    console.log("Calling Pollo.ai Veo3 API...");

    const polloResponse = await fetch(POLLO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": POLLO_API_KEY,
      },
      body: JSON.stringify({
        input: {
          image: sourceImage,
          prompt: prompt,
          negativePrompt: "blurry, low quality, distorted, ugly, bad composition, amateur, watermark, text overlay",
          length: duration || 8,
          aspectRatio: aspectRatio,
          resolution: resolution,
          generateAudio: false,
        },
      }),
    });

    if (!polloResponse.ok) {
      const errorText = await polloResponse.text();
      console.error("Pollo.ai API error:", polloResponse.status, errorText);
      
      // Check for specific error types
      if (errorText.includes("Not enough credits")) {
        throw new Error("Video API credits exhausted. Please contact support.");
      }
      
      throw new Error(`Video API error: ${polloResponse.status}`);
    }

    const polloResult = await polloResponse.json();
    console.log("Pollo.ai response received");

    // Check if we got an immediate result or need to poll
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = sourceImages[0];

    if (polloResult.output?.videoUrl) {
      videoUrl = polloResult.output.videoUrl;
      thumbnailUrl = polloResult.output.thumbnailUrl || sourceImages[0];
      console.log("Got immediate video URL");
    } else if (polloResult.id || polloResult.generationId) {
      const generationId = polloResult.id || polloResult.generationId;
      console.log("Got generation ID, polling for result:", generationId);
      
      const pollResult = await pollForCompletion(generationId, POLLO_API_KEY);
      
      if (pollResult) {
        videoUrl = pollResult.videoUrl;
        thumbnailUrl = pollResult.thumbnailUrl || sourceImages[0];
      }
    }

    if (!videoUrl) {
      throw new Error("Failed to generate video: no video URL returned");
    }

    console.log("Final video URL obtained");

    // Update video record with the generated video URL
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("Error updating video:", updateError);
      throw updateError;
    }

    console.log("Video generation completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        videoUrl,
        thumbnailUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);

    // Best-effort: mark the video as failed if we know the id
    try {
      if (requestVideoId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("videos")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", requestVideoId);
      }
    } catch (updateFail) {
      console.error("Failed to mark video as failed:", updateFail);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
