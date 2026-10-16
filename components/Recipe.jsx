import { useEffect, useRef, useState } from "react"
import RecipeCode from "./recipeCode.jsx"
import { getRecipe } from "../services/ai"

const PROVIDERS = [
    { id: "gemini", label: "Gemini" },
    { id: "groq", label: "Groq" },
]

const MOODS = [
    { id: "surprise", label: "Chef’s choice" },
    { id: "comfort", label: "Comfort" },
    { id: "bright", label: "Bright" },
    { id: "quick", label: "30 minutes" },
    { id: "showstopper", label: "For guests" },
]

const CUISINES = [
    "African",
    "Mexican",
    "Italian",
    "French",
    "Chinese",
    "Indian",
    "Japanese",
    "Thai",
    "Mediterranean",
    "Middle Eastern",
    "Caribbean",
    "Korean",
    "Spanish",
    "American",
]

const COOKING_LINES = [
    "Reading the pantry",
    "Choosing a direction",
    "Balancing the flavors",
    "Writing the method",
]

export default function Recipe(props) {
    const [recipe, setRecipe] = useState("")
    const [basedOn, setBasedOn] = useState([])
    const [provider, setProvider] = useState("gemini")
    const [mood, setMood] = useState("surprise")
    const [cuisine, setCuisine] = useState("")
    const [note, setNote] = useState("")
    const [request, setRequest] = useState({ cuisine: "", note: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [lineIndex, setLineIndex] = useState(0)
    const [error, setError] = useState("")
    const recipeRef = useRef(null)

    const ready = props.ingredients.length >= 3
    const remaining = Math.max(0, 3 - props.ingredients.length)

    useEffect(() => {
        if (!isLoading) return undefined
        setLineIndex(0)
        const timer = setInterval(() => {
            setLineIndex((current) => (current + 1) % COOKING_LINES.length)
        }, 1600)
        return () => clearInterval(timer)
    }, [isLoading])

    useEffect(() => {
        if (!recipe) return
        recipeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, [recipe])

    function clearRecipe() {
        setRecipe("")
        setBasedOn([])
        setRequest({ cuisine: "", note: "", provider: "" })
        setError("")
    }

    async function getRecipeAi() {
        setIsLoading(true)
        setError("")
        try {
            const cookNote = note.trim()
            const recipeMarkdown = await getRecipe(props.ingredients, {
                provider,
                mood,
                cuisine,
                note: cookNote,
            })
            setBasedOn(props.ingredients)
            setRequest({ cuisine, note: cookNote, provider })
            setRecipe(recipeMarkdown)
        } catch (err) {
            setError(err.message || "The kitchen is quiet. Try the recipe again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="panel recipe-panel" aria-labelledby="recipe-title" aria-busy={isLoading}>
            <p className="eyebrow">The dish</p>
            <h2 id="recipe-title">What should we cook?</h2>
            <div className="readiness" aria-hidden="true">
                {[0, 1, 2].map((step) => (
                    <span key={step} className={step < props.ingredients.length ? "dot is-on" : "dot"} />
                ))}
            </div>
            <p className="recipe-lead">
                {ready
                    ? "The pantry can carry a full dish. Choose a model, a mood, and a cuisine, then I’ll write it."
                    : `Add ${remaining} more ${remaining === 1 ? "ingredient" : "ingredients"} to unlock a recipe.`}
            </p>
            <div className="moods" role="group" aria-label="Recipe mood">
                {MOODS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={mood === option.id ? "mood is-active" : "mood"}
                        onClick={() => setMood(option.id)}
                        disabled={isLoading}
                        aria-pressed={mood === option.id}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <div className="recipe-fields">
                <label className="recipe-field">
                    <span>Cuisine</span>
                    <select
                        value={cuisine}
                        onChange={(event) => setCuisine(event.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Any cuisine</option>
                        {CUISINES.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </label>
                <label className="recipe-field">
                    <span>Note for the chef</span>
                    <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="e.g. keep it mild, no dairy, serve 4"
                        maxLength={280}
                        disabled={isLoading}
                    />
                </label>
                <div className="recipe-field">
                    <span>Model</span>
                    <div className="moods" role="group" aria-label="Recipe model">
                        {PROVIDERS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={provider === option.id ? "mood is-active" : "mood"}
                                onClick={() => setProvider(option.id)}
                                disabled={isLoading}
                                aria-pressed={provider === option.id}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <button
                type="button"
                className="write-recipe"
                onClick={getRecipeAi}
                disabled={!ready || isLoading}
            >
                {isLoading ? "Writing the recipe…" : "Write the recipe"}
            </button>
            {isLoading && <p className="cooking-line" role="status">{COOKING_LINES[lineIndex]}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}
            {recipe && (
                <RecipeCode
                    recipe={recipe}
                    basedOn={basedOn}
                    request={request}
                    clearRecipe={clearRecipe}
                    recipeRef={recipeRef}
                />
            )}
        </section>
    )
}
