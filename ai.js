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

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(apiKey || "")

/**
 * Generates a recipe using the Gemini model.
 * @param {string[]} ingredientsArr - Ingredients the cook has on hand.
 * @param {{ mood?: string, cuisine?: string, note?: string }} options - Mood, cuisine, and a free note from the cook.
 * @returns {Promise<string>} The generated recipe formatted in markdown.
 */
export async function getRecipeFromGemini(ingredientsArr, options = {}) {
    if (!apiKey) {
        throw new Error("Add VITE_GEMINI_API_KEY to your .env file, then restart the app.")
    }

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

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
        })

        const prompt = `I have ${ingredientsString}. ${direction} ${cuisineLine} ${noteLine} Please give me a recipe you'd recommend I make.`
        const result = await model.generateContent(prompt)
        const text = result.response.text()

        if (!text) {
            throw new Error("The model returned an empty recipe.")
        }

        return text
    } catch (err) {
        console.error("Gemini API Error:", err)
        throw new Error(err.message || "Failed to generate a recipe. Check the API key and try again.")
    }
}
