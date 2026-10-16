import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function RecipeCode(props) {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setCopied(false)
    }, [props.recipe])

    async function copyRecipe() {
        const text = props.recipeRef.current?.innerText || props.recipe
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
        } catch {
            setCopied(false)
        }
    }

    return (
        <article className="suggested-recipe-container" aria-live="polite" ref={props.recipeRef}>
            <div className="recipe-toolbar">
                <p>On the plate</p>
                <div>
                    <button type="button" onClick={copyRecipe}>
                        {copied ? "Copied" : "Copy recipe"}
                    </button>
                    <button type="button" onClick={props.clearRecipe}>Start over</button>
                </div>
            </div>
            {props.basedOn.length > 0 && (
                <p className="based-on">
                    Built from {props.basedOn.join(", ")}
                    {props.request?.cuisine ? ` · ${props.request.cuisine}` : ""}
                    {props.request?.note ? ` · “${props.request.note}”` : ""}
                </p>
            )}
            <div className="recipe-body">
                <ReactMarkdown>{props.recipe}</ReactMarkdown>
            </div>
        </article>
    )
}
