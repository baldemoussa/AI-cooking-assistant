import { jsPDF } from "jspdf"

const INK = [20, 52, 60]
const ACCENT = [14, 102, 112]
const MUTED = [93, 110, 116]
const PAPER = [243, 239, 232]

function plainText(value) {
    return String(value || "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim()
}

function parseRecipe(markdown) {
    const blocks = []
    let title = "Recipe"

    for (const rawLine of String(markdown || "").replace(/\r\n/g, "\n").split("\n")) {
        const line = rawLine.trim()
        if (!line) continue

        if (line.startsWith("# ")) {
            const heading = plainText(line.slice(2)) || "Recipe"
            if (!blocks.some((block) => block.type === "title")) title = heading
            blocks.push({ type: "title", text: heading })
            continue
        }

        if (line.startsWith("## ")) {
            blocks.push({ type: "heading", text: plainText(line.slice(3)) })
            continue
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
            blocks.push({ type: "bullet", text: plainText(line.slice(2)) })
            continue
        }

        const step = line.match(/^(\d+)\.\s+(.*)$/)
        if (step) {
            blocks.push({ type: "step", number: step[1], text: plainText(step[2]) })
            continue
        }

        blocks.push({ type: "paragraph", text: plainText(line) })
    }

    return { title, blocks }
}

function creditLine(basedOn, request) {
    if (!basedOn?.length) return ""

    const details = []
    if (request?.provider === "groq") details.push("Groq")
    else if (request?.provider === "gemini") details.push("Gemini")
    if (request?.cuisine) details.push(request.cuisine)
    if (request?.note) details.push(`“${request.note}”`)

    const source = `Built from ${basedOn.join(", ")}`
    return details.length ? `${source} · ${details.join(" · ")}` : source
}

function fileName(title) {
    const slug = title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60)

    return `${slug || "recipe"}.pdf`
}

function paintPage(doc) {
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()
    doc.setFillColor(...PAPER)
    doc.rect(0, 0, width, height, "F")
}

/**
 * Builds a letter-size PDF of one generated recipe.
 * @param {{ markdown: string, basedOn?: string[], request?: { provider?: string, cuisine?: string, note?: string } }} recipe
 * @returns {import("jspdf").jsPDF}
 */
export function buildRecipePdf(recipe) {
    const { title, blocks } = parseRecipe(recipe.markdown)
    const credit = creditLine(recipe.basedOn, recipe.request)
    const doc = new jsPDF({ unit: "pt", format: "letter" })
    const margin = 54
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - margin * 2
    const bottom = pageHeight - 48
    let y = margin

    doc.setProperties({ title, subject: "Recipe from AI cooking assistant" })
    paintPage(doc)

    function nextPage() {
        doc.addPage()
        paintPage(doc)
        y = margin
    }

    function ensure(height) {
        if (y + height > bottom) nextPage()
    }

    function writeWrapped(text, { size, style, color, indent = 0, gap = 0, lineHeight }) {
        const usable = contentWidth - indent
        doc.setFont("times", style)
        doc.setFontSize(size)
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, usable)
        const step = lineHeight || size * 1.35

        lines.forEach((entry) => {
            ensure(step)
            doc.text(entry, margin + indent, y)
            y += step
        })

        y += gap
    }

    writeWrapped("AI cooking assistant", {
        size: 10,
        style: "bold",
        color: ACCENT,
        gap: 8,
        lineHeight: 14,
    })

    const titleBlock = blocks.find((block) => block.type === "title")
    writeWrapped(titleBlock?.text || title, {
        size: 22,
        style: "bold",
        color: INK,
        gap: credit ? 8 : 16,
        lineHeight: 26,
    })

    if (credit) {
        writeWrapped(credit, {
            size: 10,
            style: "italic",
            color: MUTED,
            gap: 16,
            lineHeight: 14,
        })
    }

    for (const block of blocks) {
        if (block.type === "title") continue

        if (block.type === "heading") {
            y += 8
            writeWrapped(block.text, {
                size: 14,
                style: "bold",
                color: ACCENT,
                gap: 8,
                lineHeight: 18,
            })
            continue
        }

        if (block.type === "bullet") {
            ensure(16)
            doc.setFont("times", "normal")
            doc.setFontSize(12)
            doc.setTextColor(...INK)
            doc.text("•", margin, y)
            const before = y
            writeWrapped(block.text, {
                size: 12,
                style: "normal",
                color: INK,
                indent: 14,
                gap: 4,
                lineHeight: 16,
            })
            if (y === before) y += 16
            continue
        }

        if (block.type === "step") {
            const label = `${block.number}.`
            ensure(16)
            doc.setFont("times", "bold")
            doc.setFontSize(12)
            doc.setTextColor(...INK)
            doc.text(label, margin, y)
            writeWrapped(block.text, {
                size: 12,
                style: "normal",
                color: INK,
                indent: 18,
                gap: 6,
                lineHeight: 16,
            })
            continue
        }

        writeWrapped(block.text, {
            size: 12,
            style: "normal",
            color: INK,
            gap: 8,
            lineHeight: 16,
        })
    }

    const pageCount = doc.getNumberOfPages()
    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page)
        doc.setFont("times", "normal")
        doc.setFontSize(9)
        doc.setTextColor(...MUTED)
        doc.text("AI cooking assistant", margin, pageHeight - 28)
        doc.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 28, { align: "right" })
    }

    return { doc, fileName: fileName(title) }
}

/**
 * Downloads the recipe as a PDF file named from the dish.
 * @param {{ markdown: string, basedOn?: string[], request?: { provider?: string, cuisine?: string, note?: string } }} recipe
 */
export function downloadRecipePdf(recipe) {
    const { doc, fileName: name } = buildRecipePdf(recipe)
    doc.save(name)
}
