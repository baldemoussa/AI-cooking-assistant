import { useEffect, useRef, useState } from "react"
import Recipe from "./components/Recipe"
import IngredientsList from "./components/IngredientsList"

const SUGGESTIONS = [
    { name: "Garlic", quantity: "3 cloves" },
    { name: "Lemon", quantity: "1" },
    { name: "Basil", quantity: "1/4 cup" },
    { name: "Onion", quantity: "1" },
    { name: "Pasta", quantity: "8 oz" },
    { name: "Eggs", quantity: "2" },
    { name: "Rice", quantity: "1 cup" },
    { name: "Parmesan", quantity: "1/2 cup" },
]
const PANTRY_LIMIT = 12

const starterPantry = () => [
    { id: crypto.randomUUID(), name: "Chicken", quantity: "1 lb" },
    { id: crypto.randomUUID(), name: "Oregano", quantity: "1 tsp" },
    { id: crypto.randomUUID(), name: "Tomatoes", quantity: "2" },
]

function describeIngredient(ingredient) {
    const quantity = (ingredient.quantity || "").trim()
    return quantity ? `${quantity} ${ingredient.name}` : ingredient.name
}

export default function Main() {
    const [ingredients, setIngredients] = useState(starterPantry)
    const [notice, setNotice] = useState(null)
    const [confirmClear, setConfirmClear] = useState(false)
    const armedUntil = useRef(0)
    const ignoreUntil = useRef(0)

    useEffect(() => {
        if (!notice) return undefined
        const timer = setTimeout(() => setNotice(null), 2600)
        return () => clearTimeout(timer)
    }, [notice])

    useEffect(() => {
        if (!confirmClear) return undefined
        const timer = setTimeout(() => {
            armedUntil.current = 0
            setConfirmClear(false)
        }, 6000)
        return () => clearTimeout(timer)
    }, [confirmClear])

    function notify(text, tone = "ok") {
        setNotice({ text, tone, id: Date.now() })
    }

    function addIngredient(name, quantity = "") {
        const ingredientName = name.trim()
        const ingredientQuantity = quantity.trim()

        if (ingredientName === "") {
            notify("Type an ingredient first.", "warn")
            return false
        }

        if (ingredients.length >= PANTRY_LIMIT) {
            notify("Twelve ingredients is plenty. Remove one to add another.", "warn")
            return false
        }

        const isDuplicate = ingredients.some(
            (ingredient) => ingredient.name.toLowerCase() === ingredientName.toLowerCase()
        )

        if (isDuplicate) {
            notify(`${ingredientName} is already in the pantry.`, "warn")
            return false
        }

        setIngredients((current) => [
            ...current,
            { id: crypto.randomUUID(), name: ingredientName, quantity: ingredientQuantity },
        ])
        notify(`${describeIngredient({ name: ingredientName, quantity: ingredientQuantity })} added.`)
        return true
    }

    function handleSubmit(event) {
        event.preventDefault()
        const form = event.target
        const nameInput = form.elements.ingredient
        const quantityInput = form.elements.quantity
        if (addIngredient(nameInput.value, quantityInput.value)) {
            nameInput.value = ""
            quantityInput.value = ""
            quantityInput.focus()
        }
    }

    function handleDelete(id) {
        setIngredients((current) => current.filter((ingredient) => ingredient.id !== id))
        armedUntil.current = 0
        setConfirmClear(false)
    }

    function handleDeleteAll() {
        const now = Date.now()
        if (now < ignoreUntil.current) return

        if (now > armedUntil.current) {
            armedUntil.current = now + 6000
            ignoreUntil.current = now + 400
            setConfirmClear(true)
            return
        }

        armedUntil.current = 0
        setConfirmClear(false)
        setIngredients([])
        notify("Pantry cleared.")
    }

    function handleEdit(id, newName, newQuantity = "") {
        const trimmedName = newName.trim()
        const trimmedQuantity = newQuantity.trim()
        if (trimmedName === "") {
            notify("An ingredient needs a name.", "warn")
            return
        }

        const isDuplicate = ingredients.some(
            (ingredient) => ingredient.id !== id && ingredient.name.toLowerCase() === trimmedName.toLowerCase()
        )

        if (isDuplicate) {
            notify(`${trimmedName} is already in the pantry.`, "warn")
            return
        }

        setIngredients((current) => current.map((ingredient) => (
            ingredient.id === id
                ? { ...ingredient, name: trimmedName, quantity: trimmedQuantity }
                : ingredient
        )))
        notify("Ingredient updated.")
    }

    const title = ingredients.length === 0
        ? "Nothing on the counter yet"
        : ingredients.length === 1
            ? "1 ingredient on hand"
            : `${ingredients.length} ingredients on hand`

    const suggestions = SUGGESTIONS.filter((suggestion) => (
        !ingredients.some((ingredient) => ingredient.name.toLowerCase() === suggestion.name.toLowerCase())
    ))

    return (
        <main className="stage">
            <section className="panel pantry" aria-labelledby="pantry-title">
                <p className="eyebrow">The pantry</p>
                <h2 id="pantry-title">{title}</h2>
                <form className="ingredient-form" onSubmit={handleSubmit}>
                    <input
                        name="quantity"
                        type="text"
                        aria-label="Quantity"
                        placeholder="2 cups"
                        maxLength={24}
                    />
                    <input
                        name="ingredient"
                        type="text"
                        aria-label="Add ingredient"
                        placeholder="e.g. pasta, tomato, cheese"
                        maxLength={40}
                    />
                    <button type="submit">Add ingredient</button>
                </form>
                {suggestions.length > 0 && (
                    <div className="suggestions">
                        <span>Quick add</span>
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.name}
                                type="button"
                                onClick={() => addIngredient(suggestion.name, suggestion.quantity)}
                                aria-label={`Add ${describeIngredient(suggestion)}`}
                            >
                                {suggestion.name}
                            </button>
                        ))}
                    </div>
                )}
                {notice && (
                    <p className={`notice notice-${notice.tone}`} role="status">{notice.text}</p>
                )}
                <IngredientsList
                    ingredients={ingredients}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                />
                {ingredients.length === 0 && (
                    <div className="empty-pantry">
                        <p>The counter is clear.</p>
                        <p>Add three things you actually have. That’s enough to cook.</p>
                    </div>
                )}
                {ingredients.length > 0 && (
                    <button
                        type="button"
                        className={`clear-pantry ${confirmClear ? "is-confirming" : ""}`}
                        onClick={handleDeleteAll}
                    >
                        {confirmClear ? "Click again to clear" : "Clear pantry"}
                    </button>
                )}
            </section>
            <Recipe ingredients={ingredients.map(describeIngredient)} />
        </main>
    )
}
