import { NextResponse } from "next/server";
import Groq from "groq-sdk";
//import connectDB from "@/lib/mongodb";
//import RecipeHistory from "@/models/RecipeHistory";
import RecipeHistory from "@/app/bck_lib/RecipeHistory";
import connectDB from "@/app/bck_lib/mongodb";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Max image size = 5MB
const MAX_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json();
    const {
      ingredients = [],
      imageBase64,
      mediaType,
      userId = "guest",
    } = body;

    // ── VALIDATION ────────────────────────────────────────────
    if (!ingredients.length && !imageBase64) {
      return NextResponse.json(
        { error: "Provide ingredients or an image." },
        { status: 400 }
      );
    }

    if (imageBase64) {
      if (!ALLOWED_TYPES.includes(mediaType)) {
        return NextResponse.json(
          { error: "Unsupported image type. Use JPEG, PNG, WEBP or GIF." },
          { status: 400 }
        );
      }

      const sizeInBytes = Buffer.from(imageBase64, "base64").length;
      if (sizeInBytes > MAX_SIZE) {
        return NextResponse.json(
          { error: "Image too large. Maximum size is 5MB." },
          { status: 400 }
        );
      }
    }

    // ── BUILD MESSAGES FOR GROQ ───────────────────────────────
    let messages;
    let model;

    if (imageBase64) {
      // Vision mode — use llama-4 scout which supports images
      model = "meta-llama/llama-4-scout-17b-16e-instruct";

      messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: buildImagePrompt(ingredients),
            },
          ],
        },
      ];
    } else {
      // Text mode — use llama3 (fast + cheap)
      model = "llama-3.3-70b-versatile";

      messages = [
        {
          role: "user",
          content: buildTextPrompt(ingredients),
        },
      ];
    }

    // ── CALL GROQ API ─────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }, // forces JSON output
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // ── PARSE RESPONSE ────────────────────────────────────────
    const parsed = safeParseJSON(raw);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse AI response.", raw },
        { status: 500 }
      );
    }

    // ── SAVE TO MONGODB ───────────────────────────────────────
    await RecipeHistory.create({
      userId,
      ingredients: parsed.detectedIngredients?.length
        ? parsed.detectedIngredients
        : ingredients,
      detected: parsed.detectedIngredients || [],
      recipes: parsed.recipes,
      fromImage: !!imageBase64,
    });

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("generate-recipe error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── HELPERS ───────────────────────────────────────────────────

function buildImagePrompt(extraIngredients) {
  const extra = extraIngredients.length
    ? `\nAlso include these extra ingredients the user mentioned: ${extraIngredients.join(", ")}.`
    : "";

  return `You are a professional chef and food expert.

Look carefully at this image and:
1. Identify ALL visible food ingredients, produce, proteins and pantry items.
2. List every ingredient you can see clearly.
3. Generate 3 creative, delicious recipes using those ingredients.${extra}

Return ONLY a valid JSON object with NO markdown, NO explanation, NO extra text:

{
  "detectedIngredients": ["ingredient1", "ingredient2"],
  "recipes": [
    {
      "name": "Recipe Name",
      "emoji": "🍳",
      "cookTime": "25 min",
      "difficulty": "Easy",
      "description": "A short enticing description of the dish.",
      "ingredients": ["200g chicken", "2 cloves garlic"],
      "steps": [
        "Step 1 description.",
        "Step 2 description."
      ]
    }
  ]
}`;
}

function buildTextPrompt(ingredients) {
  return `You are a professional chef.

Generate 3 creative and delicious recipes using these ingredients: ${ingredients.join(", ")}.

Return ONLY a valid JSON object with NO markdown, NO explanation, NO extra text:

{
  "detectedIngredients": [],
  "recipes": [
    {
      "name": "Recipe Name",
      "emoji": "🍳",
      "cookTime": "25 min",
      "difficulty": "Easy",
      "description": "A short enticing description of the dish.",
      "ingredients": ["200g chicken", "2 cloves garlic"],
      "steps": [
        "Step 1 description.",
        "Step 2 description."
      ]
    }
  ]
}`;
}

function safeParseJSON(raw) {
  try {
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(clean);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}