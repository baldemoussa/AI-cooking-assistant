import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { downloadRecipePdf } from "../services/recipePdf"

export default function RecipeCode(props) {
    const [copied, setCopied] = useState(false)
    const [pdfState, setPdfState] = useState("idle")

    useEffect(() => {
        setCopied(false)
        setPdfState("idle")
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

    function savePdf() {
        try {
            downloadRecipePdf({
                markdown: props.recipe,
                basedOn: props.basedOn,
                request: props.request,
            })
            setPdfState("saved")
        } catch {
            setPdfState("error")
        }
    }

    return (
        <article className="suggested-recipe-container" aria-live="polite" ref={props.recipeRef}>
            <div className="recipe-toolbar">
                <p>On the plate</p>
                <div className="recipe-actions">
                    <button type="button" onClick={copyRecipe}>
                        {copied ? "Copied" : "Copy recipe"}
                    </button>
                    <button type="button" onClick={savePdf}>
                        {pdfState === "saved" ? "Saved" : pdfState === "error" ? "Try PDF again" : "Save PDF"}
                    </button>
                    <button type="button" onClick={props.clearRecipe}>Start over</button>
                </div>
            </div>
            {props.basedOn.length > 0 && (
                <p className="based-on">
                    Built from {props.basedOn.join(", ")}
                    {props.request?.provider === "groq" ? " · Groq" : props.request?.provider === "gemini" ? " · Gemini" : ""}
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
