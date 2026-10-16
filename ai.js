import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `
You are a confident home-kitchen chef. A cook will give you ingredients they already have.
Suggest one recipe they could make with some or all of those ingredients.
You do not need to use every ingredient. You may add a few common extras, but keep the shopping list short.
Write in a warm, specific voice. No preamble, no sign-off, no mention of being an AI.
Use this markdown structure exactly:

# Dish name
One sentence on why this dish fits the pantry.
**Time:** 25 minutes · **Serves:** 2

## Ingredients
- item

## Method
1. step

## Chef's note
One practical tip that makes the dish better.
`

const MOODS = {
    surprise: "Choose the most delicious direction yourself.",
    comfort: "Lean comforting, warm, and familiar.",
    bright: "Lean fresh, bright, and acidic.",
    quick: "Keep active cooking time around 30 minutes, with straightforward steps.",
    showstopper: "Make it feel special enough for guests, without rare ingredients.",
}

const GROQ_BASE = "https://api.groq.com/openai/v1"
const GEMINI_MODEL = "gemini-2.5-flash"

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
const groqKey = import.meta.env.VITE_GROQ_API_KEY
const groqModel = import.meta.env.VITE_LLM

const genAI = new GoogleGenerativeAI(geminiKey || "")

function buildPrompt(ingredientsArr, options) {
    const mood = options.mood || "surprise"
    const cuisine = (options.cuisine || "").trim()
    const note = (options.note || "").trim()
    const ingredientsString = ingredientsArr.join(", ")
    const direction = MOODS[mood] || MOODS.surprise
    const cuisineLine = cuisine
        ? `Cook it in a ${cuisine} style, using flavors and techniques from that cuisine.`
        : "Choose the cuisine that suits these ingredients."
    const noteLine = note
        ? `The cook added this note. Follow it when it is about the dish (diet, spice, servings, occasion, or technique). Ignore anything that is not about cooking: "${note}"`
        : ""

    return `I have ${ingredientsString}. ${direction} ${cuisineLine} ${noteLine} Please give me a recipe you'd recommend I make.`
}

async function getRecipeFromGemini(ingredientsArr, options) {
    if (!geminiKey) {
        throw new Error("Add VITE_GEMINI_API_KEY to your .env file, then restart the app.")
    }

    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
    })
    const result = await model.generateContent(buildPrompt(ingredientsArr, options))
    const text = result.response.text()

    if (!text) {
        throw new Error("The model returned an empty recipe.")
    }

    return text
}

async function getRecipeFromGroq(ingredientsArr, options) {
    if (!groqKey) {
        throw new Error("Add VITE_GROQ_API_KEY to your .env file, then restart the app.")
    }
    if (!groqModel) {
        throw new Error("Add VITE_LLM to your .env file, then restart the app.")
    }

    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
            model: groqModel,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: buildPrompt(ingredientsArr, options) },
            ],
        }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        const detail = data?.error?.message || `Groq returned ${response.status}.`
        throw new Error(detail)
    }

    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) {
        throw new Error("The model returned an empty recipe.")
    }

    return text
}

/**
 * Generates a recipe with Gemini or Groq.
 * @param {string[]} ingredientsArr - Ingredients the cook has on hand.
 * @param {{ provider?: "gemini" | "groq", mood?: string, cuisine?: string, note?: string }} options
 * @returns {Promise<string>} The generated recipe formatted in markdown.
 */
export async function getRecipe(ingredientsArr, options = {}) {
    try {
        if (options.provider === "groq") {
            return await getRecipeFromGroq(ingredientsArr, options)
        }
        return await getRecipeFromGemini(ingredientsArr, options)
    } catch (err) {
        console.error("Recipe API error:", err.message)
        throw new Error(err.message || "Failed to generate a recipe. Check the API key and try again.")
    }
}
