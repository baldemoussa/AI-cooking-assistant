import { useState } from "react"

export default function IngredientsList(props) {
    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState("")
    const [editQuantity, setEditQuantity] = useState("")

    if (props.ingredients.length === 0) return null

    function startEdit(ingredient) {
        setEditingId(ingredient.id)
        setEditValue(ingredient.name)
        setEditQuantity(ingredient.quantity || "")
    }

    function saveEdit(id) {
        if (editValue.trim() !== "") {
            props.handleEdit(id, editValue, editQuantity)
        }
        setEditingId(null)
        setEditValue("")
        setEditQuantity("")
    }

    function cancelEdit() {
        setEditingId(null)
        setEditValue("")
        setEditQuantity("")
    }

    function handleBlur(event, id) {
        const next = event.relatedTarget
        if (next?.dataset?.editAction) return
        if (next?.closest(".edit-container")) return
        saveEdit(id)
    }

    function handleKeyDown(event, id) {
        if (event.key === "Enter") {
            event.preventDefault()
            saveEdit(id)
        } else if (event.key === "Escape") {
            cancelEdit()
        }
    }

    return (
        <ul className="ingredients-list">
            {props.ingredients.map((ingredient, index) => (
                <li key={ingredient.id} className="ingredient-row">
                    <span className="ingredient-index" aria-hidden="true">{index + 1}</span>
                    {editingId === ingredient.id ? (
                        <div className="edit-container">
                            <input
                                type="text"
                                value={editQuantity}
                                onChange={(event) => setEditQuantity(event.target.value)}
                                onBlur={(event) => handleBlur(event, ingredient.id)}
                                onKeyDown={(event) => handleKeyDown(event, ingredient.id)}
                                autoFocus
                                maxLength={24}
                                className="edit-input quantity-input"
                                aria-label={`Quantity for ${ingredient.name}`}
                                placeholder="2 cups"
                            />
                            <input
                                type="text"
                                value={editValue}
                                onChange={(event) => setEditValue(event.target.value)}
                                onBlur={(event) => handleBlur(event, ingredient.id)}
                                onKeyDown={(event) => handleKeyDown(event, ingredient.id)}
                                maxLength={40}
                                className="edit-input"
                                aria-label={`Edit ${ingredient.name}`}
                            />
                            <div className="edit-actions">
                                <button
                                    type="button"
                                    data-edit-action="save"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => saveEdit(ingredient.id)}
                                    className="save-btn"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    data-edit-action="cancel"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={cancelEdit}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {ingredient.quantity && (
                                <span className="ingredient-qty">{ingredient.quantity}</span>
                            )}
                            <span className="ingredient-name">{ingredient.name}</span>
                            <button type="button" className="ghost-btn" onClick={() => startEdit(ingredient)}>
                                Edit
                            </button>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => props.handleDelete(ingredient.id)}
                                aria-label={`Remove ${ingredient.name}`}
                            >
                                Remove
                            </button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    )
}
