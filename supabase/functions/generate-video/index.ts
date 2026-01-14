import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, title, description, sourceImages, duration, aspectRatio, platform, style } = await req.json();

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
    const prompt = buildVideoPrompt(title, description, platform, aspectRatio, style || 'cinematic');
    console.log("Video prompt:", prompt);

    // Use the first image as the starting frame
    const startingImage = sourceImages[0];
    
    // Generate video using Lovable AI with image-to-video
    console.log("Calling Lovable AI for video generation...");
    
    const videoResponse = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        starting_frame: startingImage,
        duration: duration,
        aspect_ratio: aspectRatio,
        resolution: "1080p",
      }),
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error("Video generation error:", videoResponse.status, errorText);
      
      if (videoResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (videoResponse.status === 402) {
        throw new Error("Insufficient credits. Please add credits to continue.");
      }
      
      throw new Error(`Video generation failed: ${errorText}`);
    }

    const videoResult = await videoResponse.json();
    console.log("Video generation result:", JSON.stringify(videoResult).substring(0, 200));

    // Extract video URL from response
    const videoUrl = videoResult.video_url || videoResult.data?.video_url || null;
    const thumbnailUrl = sourceImages[0]; // Use first image as thumbnail

    // Update video record
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: videoUrl ? "completed" : "failed",
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
      }
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
