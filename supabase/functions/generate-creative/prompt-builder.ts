// ============================================
// SISTEMA DE PROMPTS MODULARES PARA CRIATIVOS
// ============================================

// ========== MICRO-PROMPTS POR NICHO ==========
export const nichePrompts: Record<string, {
  keywords: string[];
  mood: string;
  visualElements: string[];
  colorPalette: string;
}> = {
  // Fitness & Saúde
  fitness: {
    keywords: ["athletic", "powerful", "energetic", "healthy lifestyle", "transformation"],
    mood: "motivational, empowering, dynamic",
    visualElements: ["gym equipment", "healthy food", "athletic bodies", "workout scenes", "nature fitness"],
    colorPalette: "vibrant oranges, energetic greens, powerful blacks",
  },
  saude: {
    keywords: ["wellness", "healing", "natural", "vitality", "balance"],
    mood: "calming, trustworthy, professional",
    visualElements: ["medical symbols", "nature elements", "clean spaces", "happy people"],
    colorPalette: "soft greens, clean whites, calming blues",
  },
  
  // Moda & Beleza
  moda: {
    keywords: ["stylish", "trendy", "elegant", "fashionable", "chic"],
    mood: "sophisticated, aspirational, trendy",
    visualElements: ["fashion accessories", "textures", "fabrics", "lifestyle scenes"],
    colorPalette: "neutral tones, bold accents, metallics",
  },
  beleza: {
    keywords: ["glamorous", "radiant", "beautiful", "skincare", "makeup"],
    mood: "luxurious, feminine, empowering",
    visualElements: ["beauty products", "soft lighting", "skin textures", "flowers"],
    colorPalette: "soft pinks, golds, clean whites, rose tones",
  },
  
  // Tecnologia & Digital
  tecnologia: {
    keywords: ["innovative", "futuristic", "cutting-edge", "digital", "smart"],
    mood: "modern, professional, exciting",
    visualElements: ["devices", "circuits", "data visualization", "sleek interfaces"],
    colorPalette: "electric blues, neon accents, dark backgrounds, silver",
  },
  marketing: {
    keywords: ["growth", "success", "strategy", "results", "digital"],
    mood: "professional, confident, results-driven",
    visualElements: ["graphs", "targets", "devices", "business settings"],
    colorPalette: "bold blues, success greens, professional grays",
  },
  
  // Educação & Cursos
  educacao: {
    keywords: ["learning", "growth", "knowledge", "transformation", "expert"],
    mood: "inspiring, trustworthy, accessible",
    visualElements: ["books", "lightbulbs", "graduation", "study scenes"],
    colorPalette: "warm oranges, trustworthy blues, clean backgrounds",
  },
  cursos: {
    keywords: ["online learning", "skill development", "certification", "expertise"],
    mood: "motivational, professional, accessible",
    visualElements: ["laptops", "certificates", "happy students", "success symbols"],
    colorPalette: "energetic purples, trust blues, success greens",
  },
  
  // Finanças & Investimentos
  financas: {
    keywords: ["wealth", "security", "growth", "investment", "success"],
    mood: "trustworthy, professional, aspirational",
    visualElements: ["charts", "money symbols", "buildings", "success imagery"],
    colorPalette: "gold accents, deep greens, navy blues, black",
  },
  investimentos: {
    keywords: ["returns", "portfolio", "wealth building", "financial freedom"],
    mood: "sophisticated, exclusive, confident",
    visualElements: ["stock charts", "luxury items", "cityscapes", "growth symbols"],
    colorPalette: "gold, dark greens, elegant blacks, silver accents",
  },
  
  // Alimentação & Gastronomia
  alimentacao: {
    keywords: ["delicious", "fresh", "healthy", "appetizing", "gourmet"],
    mood: "appetizing, warm, inviting",
    visualElements: ["food photography", "fresh ingredients", "cooking scenes", "table settings"],
    colorPalette: "warm reds, fresh greens, appetizing yellows, natural browns",
  },
  restaurante: {
    keywords: ["culinary", "dining", "chef", "experience", "taste"],
    mood: "sophisticated, inviting, appetizing",
    visualElements: ["plated dishes", "restaurant ambiance", "chef elements", "wine"],
    colorPalette: "warm lighting tones, rich burgundies, elegant creams",
  },
  
  // Imobiliário
  imoveis: {
    keywords: ["home", "investment", "luxury", "dream home", "real estate"],
    mood: "aspirational, trustworthy, welcoming",
    visualElements: ["beautiful homes", "interiors", "architecture", "happy families"],
    colorPalette: "warm neutrals, trustworthy blues, gold accents",
  },
  
  // Pet & Animais
  pet: {
    keywords: ["cute", "loving", "care", "furry friends", "pet lovers"],
    mood: "warm, playful, loving",
    visualElements: ["happy pets", "pet accessories", "nature scenes", "cuddles"],
    colorPalette: "warm oranges, soft greens, playful yellows, gentle browns",
  },
  
  // Viagem & Turismo
  viagem: {
    keywords: ["adventure", "explore", "destination", "wanderlust", "experience"],
    mood: "adventurous, inspiring, exciting",
    visualElements: ["landscapes", "landmarks", "travelers", "suitcases", "maps"],
    colorPalette: "sky blues, sunset oranges, tropical greens, adventure golds",
  },
  
  // Esportes
  esportes: {
    keywords: ["competition", "victory", "team", "performance", "champion"],
    mood: "energetic, competitive, inspiring",
    visualElements: ["sports equipment", "athletes", "stadiums", "action shots"],
    colorPalette: "bold reds, energetic blues, winner golds, powerful blacks",
  },
  
  // Infantil
  infantil: {
    keywords: ["fun", "playful", "colorful", "magical", "educational"],
    mood: "joyful, magical, safe",
    visualElements: ["toys", "cartoons", "colorful elements", "happy children"],
    colorPalette: "bright primary colors, playful pastels, rainbow tones",
  },
  
  // Automotivo
  automotivo: {
    keywords: ["speed", "performance", "luxury", "power", "design"],
    mood: "powerful, sophisticated, exciting",
    visualElements: ["cars", "roads", "speed elements", "showroom scenes"],
    colorPalette: "metallic silvers, deep blacks, racing reds, luxury golds",
  },
  
  // Default para nichos não mapeados
  default: {
    keywords: ["professional", "quality", "trust", "excellence"],
    mood: "professional, trustworthy, modern",
    visualElements: ["clean backgrounds", "product focus", "lifestyle imagery"],
    colorPalette: "versatile neutrals with accent colors",
  },
};

// ========== TEMPLATES VISUAIS ==========
export const templateStyles: Record<string, {
  description: string;
  composition: string;
  lighting: string;
  effects: string;
}> = {
  minimalista: {
    description: "minimalist, clean, sophisticated, lots of white space",
    composition: "centered subject, negative space, simple geometry, rule of thirds",
    lighting: "soft, even, natural lighting, no harsh shadows",
    effects: "subtle gradients, clean edges, matte finish",
  },
  publicitario: {
    description: "advertising, bold, eye-catching, high contrast, commercial",
    composition: "dynamic angles, bold typography space, action-oriented",
    lighting: "dramatic, high contrast, strategic shadows, spotlight effect",
    effects: "vibrant saturation, sharp details, impactful visuals",
  },
  dark_premium: {
    description: "dark luxury, elegant, exclusive, premium, sophisticated black",
    composition: "cinematic framing, luxury placement, golden ratio",
    lighting: "moody, rim lighting, dramatic shadows, accent highlights",
    effects: "deep blacks, gold/silver accents, subtle glow, rich contrast",
  },
  clean: {
    description: "bright, airy, fresh, approachable, friendly",
    composition: "open layout, breathing room, welcoming arrangement",
    lighting: "bright, soft shadows, daylight feel, uplifting",
    effects: "light pastels, subtle shadows, fresh and inviting",
  },
  chamativo: {
    description: "vibrant, bold colors, attention-grabbing, energetic, pop art inspired",
    composition: "bold shapes, overlapping elements, dynamic movement",
    lighting: "bright, neon-like, colorful lighting, energetic",
    effects: "high saturation, color gradients, bold contrasts, electric feel",
  },
};

// ========== TIPOS DE CRIATIVO ==========
export const creativeTypePrompts: Record<string, {
  focus: string;
  elements: string[];
  callToAction: string;
}> = {
  venda: {
    focus: "conversion, urgency, value proposition, product showcase",
    elements: ["product prominence", "price/offer visibility", "scarcity cues", "benefit highlights"],
    callToAction: "Buy now, Get yours, Limited offer, Shop today",
  },
  promocao: {
    focus: "discount, special offer, limited time, savings",
    elements: ["percentage off", "sale badge", "countdown urgency", "comparison"],
    callToAction: "Save now, Don't miss out, Grab the deal, Limited time",
  },
  branding: {
    focus: "brand identity, recognition, values, emotional connection",
    elements: ["logo integration", "brand colors", "lifestyle imagery", "aspirational"],
    callToAction: "Discover, Experience, Join us, Be part of",
  },
  autoridade: {
    focus: "expertise, credibility, trust, leadership",
    elements: ["credentials", "testimonials space", "achievements", "professional imagery"],
    callToAction: "Learn from experts, Get certified, Join professionals",
  },
  storytelling: {
    focus: "narrative, emotion, connection, journey",
    elements: ["before/after", "journey visualization", "emotional triggers", "relatable scenes"],
    callToAction: "Start your journey, Transform today, Your story begins",
  },
};

// ========== REDES SOCIAIS ==========
export const platformSpecs: Record<string, {
  aspectRatio: string;
  style: string;
  attention: string;
}> = {
  instagram: {
    aspectRatio: "1:1 square, perfect for feed",
    style: "aesthetic, scroll-stopping, Instagram-worthy, highly visual",
    attention: "first 3 seconds crucial, thumb-stopping visual",
  },
  facebook: {
    aspectRatio: "1.91:1 landscape or 1:1 square",
    style: "engaging, shareable, community-friendly",
    attention: "clear messaging, social proof friendly",
  },
  tiktok: {
    aspectRatio: "9:16 vertical, full screen",
    style: "trendy, dynamic, gen-z friendly, authentic",
    attention: "instant hook, movement-friendly composition",
  },
  google_ads: {
    aspectRatio: "various, responsive design",
    style: "clean, professional, clear CTA, conversion-focused",
    attention: "clear value proposition, minimal distraction",
  },
};

// ========== CONSTRUTOR DE PROMPT PRINCIPAL ==========
export function buildImagePrompt(params: {
  niche: string;
  product: string;
  template: string;
  creative_type: string;
  social_network: string;
  objective: string;
  tone: string;
}): string {
  const { niche, product, template, creative_type, social_network, objective, tone } = params;

  // Busca dados do nicho (normaliza para lowercase)
  const nicheKey = niche.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_');
  const nicheData = nichePrompts[nicheKey] || nichePrompts.default;

  // Busca dados do template
  const templateData = templateStyles[template] || templateStyles.minimalista;

  // Busca dados do tipo de criativo
  const typeData = creativeTypePrompts[creative_type] || creativeTypePrompts.venda;

  // Busca dados da plataforma
  const platformData = platformSpecs[social_network] || platformSpecs.instagram;

  // Constrói o prompt modular
  const prompt = `Create a stunning, professional advertisement image.

=== SUBJECT ===
Product/Service: ${product}
Industry: ${niche}

=== VISUAL STYLE ===
Template: ${templateData.description}
Composition: ${templateData.composition}
Lighting: ${templateData.lighting}
Effects: ${templateData.effects}

=== NICHE-SPECIFIC ELEMENTS ===
Mood: ${nicheData.mood}
Visual Elements: ${nicheData.visualElements.join(', ')}
Color Palette: ${nicheData.colorPalette}
Keywords: ${nicheData.keywords.join(', ')}

=== CREATIVE TYPE ===
Focus: ${typeData.focus}
Key Elements: ${typeData.elements.join(', ')}

=== PLATFORM OPTIMIZATION ===
Platform: ${social_network}
Format: ${platformData.aspectRatio}
Style: ${platformData.style}
Attention Strategy: ${platformData.attention}

=== CRITICAL REQUIREMENTS ===
- Ultra high resolution, professional quality
- NO text, words, letters, or typography in the image
- Clean, polished, commercial-ready
- ${platformData.aspectRatio}
- Scroll-stopping visual impact
- Product/subject clearly visible and prominent`;

  return prompt;
}

// ========== PROMPT PARA COPY ==========
export function buildCopyPrompt(params: {
  niche: string;
  product: string;
  objective: string;
  social_network: string;
  tone: string;
  creative_type: string;
}): string {
  const { niche, product, objective, social_network, tone, creative_type } = params;

  const objectiveLabels: Record<string, string> = {
    sales: "vendas diretas e conversão imediata",
    leads: "captação de leads e geração de interesse",
    engagement: "engajamento, comentários e compartilhamentos",
    brand: "reconhecimento e fortalecimento de marca",
  };

  const toneLabels: Record<string, string> = {
    professional: "profissional, corporativo e confiável",
    informal: "informal, descontraído e próximo",
    persuasive: "persuasivo, convincente e urgente",
    creative: "criativo, inovador e surpreendente",
  };

  const networkLabels: Record<string, string> = {
    instagram: "Instagram (carrossel, reels, stories)",
    facebook: "Facebook (feed, anúncios)",
    tiktok: "TikTok (vídeos curtos, trends)",
    google_ads: "Google Ads (pesquisa, display)",
  };

  const typeLabels: Record<string, string> = {
    venda: "foco em conversão e venda direta",
    promocao: "destaque para oferta e desconto",
    branding: "construção de marca e identidade",
    autoridade: "posicionamento como especialista",
    storytelling: "narrativa emocional e envolvente",
  };

  return `Você é um copywriter expert em marketing digital brasileiro. Crie copies persuasivas e que convertem.

=== BRIEFING ===
Nicho: ${niche}
Produto/Serviço: ${product}
Objetivo: ${objectiveLabels[objective] || objective}
Rede Social: ${networkLabels[social_network] || social_network}
Tom: ${toneLabels[tone] || tone}
Tipo de Criativo: ${typeLabels[creative_type] || creative_type}

=== INSTRUÇÕES ===
Gere exatamente 3 variações diferentes de copy, cada uma com:

1. HEADLINE (título chamativo)
   - Máximo 10 palavras
   - Use gatilhos mentais
   - Seja específico e impactante

2. TEXTO PRINCIPAL (copy persuasiva)
   - Entre 50-100 palavras
   - Foque nos benefícios
   - Use storytelling quando apropriado
   - Inclua prova social quando possível

3. CTA (chamada para ação)
   - Máximo 5 palavras
   - Seja direto e urgente
   - Use verbos de ação

=== DICAS DE CONVERSÃO ===
- Use números específicos
- Crie senso de urgência
- Destaque a transformação
- Fale a língua do público
- Use palavras de poder

Responda usando a função fornecida.`;
}
