import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev";

// Helper function to call the Lovable AI Gateway for video generation
async function callGatewayVideoGeneration(
  params: {
    model?: string;
    prompt: string;
    starting_frame?: string;
    duration?: number;
    aspect_ratio?: string;
    resolution?: string;
  },
  apiKey: string
): Promise<any> {
  const response = await fetch(`${GATEWAY_URL}/v1/video/generations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || "minimax/video-01",
      prompt: params.prompt,
      first_frame_image: params.starting_frame,
      // duration and aspect_ratio may not be supported by all models
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gateway error response:", errorText);
    throw new Error(`Gateway error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Try to pick a video model from available models
async function pickVideoModelId(apiKey: string): Promise<string | null> {
  try {
    const response = await fetch(`${GATEWAY_URL}/v1/models`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const models = data?.data || [];
    // Look for video-capable models
    const videoModel = models.find((m: any) => 
      m.id?.includes("video") || m.id?.includes("minimax")
    );
    return videoModel?.id || null;
  } catch {
    return null;
  }
}

// Extract video URL from various response formats
function extractVideoUrl(result: any): string | null {
  if (!result) return null;
  
  // Direct video URL
  if (typeof result.video_url === "string") return result.video_url;
  if (typeof result.url === "string") return result.url;
  
  // Nested in data array
  if (Array.isArray(result.data) && result.data[0]) {
    const first = result.data[0];
    if (typeof first.url === "string") return first.url;
    if (typeof first.video_url === "string") return first.video_url;
    if (typeof first.video === "string") return first.video;
  }
  
  // Nested in video object
  if (result.video && typeof result.video.url === "string") return result.video.url;
  
  // Output field
  if (typeof result.output === "string" && result.output.startsWith("http")) return result.output;
  
  return null;
}

// Poll the gateway for video URL (for async generation)
async function pollGatewayForVideoUrl(
  generationId: string,
  apiKey: string,
  timeoutMs: number
): Promise<string | null> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`${GATEWAY_URL}/v1/video/generations/${generationId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
      });
      
      if (response.ok) {
        const result = await response.json();
        const url = extractVideoUrl(result);
        if (url) return url;
        
        // Check if failed
        if (result.status === "failed" || result.error) {
          console.error("Video generation failed:", result.error);
          return null;
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return null;
}

// Extract text from gateway response (for error messages)
function extractGatewayText(result: any): string | null {
  if (!result) return null;
  
  // Chat completion format
  if (result.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }
  
  // Direct text
  if (typeof result.text === "string") return result.text;
  if (typeof result.message === "string") return result.message;
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestVideoId: string | undefined;

  try {
    const body = await req.json();
    const { videoId, title, description, sourceImages, duration, aspectRatio, platform, style } = body ?? {};
    requestVideoId = videoId;

    if (!videoId) throw new Error("Missing videoId");
    if (!title) throw new Error("Missing title");
    if (!Array.isArray(sourceImages) || sourceImages.length === 0) throw new Error("Missing sourceImages");

    console.log("Generate video request:", { videoId, title, platform, duration, aspectRatio, style });
    console.log("Source images:", sourceImages);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build prompt for video generation
    const prompt = buildVideoPrompt(title, description ?? "", platform ?? "reels", aspectRatio ?? "9:16", style || "cinematic");
    console.log("Video prompt:", prompt);

    // Use the first image as the starting frame
    const startingImage = sourceImages[0];

    // Generate video using Lovable AI with image-to-video
    console.log("Calling Lovable AI for video generation...");

    let videoResult = await callGatewayVideoGeneration(
      {
        prompt,
        starting_frame: startingImage,
        duration,
        aspect_ratio: aspectRatio,
        resolution: "1080p",
      },
      LOVABLE_API_KEY,
    );

    console.log("Video generation result:", JSON.stringify(videoResult).substring(0, 500));

    // If gateway returns a chat completion, retry with an explicit video model (if available)
    if (videoResult?.object === "chat.completion") {
      console.warn("Video endpoint returned chat.completion (likely wrong routing). Trying to auto-select a video model and retry...");
      const modelId = await pickVideoModelId(LOVABLE_API_KEY);
      if (modelId) {
        console.log("Retrying video generation with model:", modelId);
        videoResult = await callGatewayVideoGeneration(
          {
            model: modelId,
            prompt,
            starting_frame: startingImage,
            duration,
            aspect_ratio: aspectRatio,
            resolution: "1080p",
          },
          LOVABLE_API_KEY,
        );
        console.log("Video generation retry result:", JSON.stringify(videoResult).substring(0, 500));
      }
    }

    // Extract video URL from response - handle multiple response formats
    let videoUrl = extractVideoUrl(videoResult);

    // If we got a generation id but no URL, try polling the job (best-effort)
    if (!videoUrl && typeof videoResult?.id === "string" && videoResult?.object !== "chat.completion") {
      console.log("No video URL in initial response, polling generation id:", videoResult.id);
      videoUrl = await pollGatewayForVideoUrl(videoResult.id, LOVABLE_API_KEY, 90_000);
    }

    // If still null, consider this a failure (so the UI can show a proper error)
    if (!videoUrl) {
      const maybeText = extractGatewayText(videoResult);
      if (maybeText) {
        console.warn("Gateway returned text instead of a video URL:", maybeText.substring(0, 200));
      }
      throw new Error("Falha ao gerar vídeo: não foi possível obter a URL do vídeo gerado.");
    }

    console.log("Extracted video URL:", videoUrl);
    const thumbnailUrl = sourceImages[0]; // Use first image as thumbnail

    // Update video record
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

function buildVideoPrompt(title: string, description: string, platform: string, aspectRatio: string, style: string): string {
  const platformDescriptions: Record<string, string> = {
    reels: "Instagram Reels vertical video optimized for mobile viewing",
    tiktok: "TikTok viral-worthy vertical short-form video",
    youtube_shorts: "YouTube Shorts attention-grabbing vertical video",
    feed: "Instagram feed square video with perfect 1:1 composition",
    landscape: "YouTube/Facebook cinematic landscape video",
  };

  const styleDescriptions: Record<string, string> = {
    cinematic: `Cinematic masterpiece with:
      - Smooth dolly/crane movements and elegant camera work
      - Film-like color grading with rich contrast and depth
      - Dramatic lighting with volumetric rays and lens flares
      - Slow, deliberate pacing with meaningful transitions
      - Anamorphic lens effects and subtle film grain
      - Ken Burns effect with parallax depth
      - Professional Hollywood-style cinematography`,
    
    energetic: `High-energy dynamic video with:
      - Fast-paced cuts and quick zoom transitions
      - Vibrant, saturated colors that pop
      - Beat-sync ready with punchy movements
      - Glitch effects and motion blur for speed
      - Dynamic scaling and rotation effects
      - Particle effects and light trails
      - Exciting, attention-grabbing rhythm`,
    
    calm: `Peaceful, zen-like video with:
      - Gentle, floating camera movements
      - Soft, dreamy color palette with muted tones
      - Slow dissolve transitions
      - Subtle breathing effect (gentle zoom in/out)
      - Soft focus and bokeh elements
      - Flowing, organic motion paths
      - Meditative, relaxing atmosphere`,
    
    professional: `Corporate-quality professional video with:
      - Clean, precise camera movements
      - Sleek, modern color grading
      - Minimalist transitions and effects
      - Elegant typography-ready compositions
      - Sharp focus and clear visuals
      - Subtle scaling for emphasis
      - Business-appropriate sophisticated style`,
    
    playful: `Fun, engaging video with:
      - Bouncy, playful camera movements
      - Bright, cheerful color palette
      - Quirky transitions and pop effects
      - Confetti and sparkle overlays
      - Cartoon-like motion with squash/stretch
      - Energetic but friendly pacing
      - Joyful, celebratory atmosphere`,
    
    dramatic: `Epic, impactful video with:
      - Powerful camera pushes and reveals
      - High contrast, moody color grading
      - Intense light flares and god rays
      - Epic scale transitions
      - Thunder/smoke overlay effects
      - Building tension with zoom
      - Blockbuster movie trailer style`,
  };

  const platformDesc = platformDescriptions[platform] || "social media video";
  const styleDesc = styleDescriptions[style] || styleDescriptions.cinematic;
  
  let prompt = `Create a stunning ${platformDesc} with ${aspectRatio} aspect ratio.

CONTENT:
Title: "${title}"
${description ? `Description: ${description}` : ''}

STYLE REQUIREMENTS:
${styleDesc}

TECHNICAL EXCELLENCE:
- Ultra high quality rendering with crisp details
- Perfect exposure and white balance
- Smooth 24fps cinematic motion
- Professional color science
- Seamless loop-ready ending
- Social media optimized for maximum engagement
- Trending visual effects for ${new Date().getFullYear()}

Make this video absolutely stunning and scroll-stopping. It should feel premium, polished, and ready for viral success.`;
  
  return prompt;
}
