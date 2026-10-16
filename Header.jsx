import { useEffect, useState } from "react"
import chefClaudeLogo from "./images/chef-claude-icon.jpeg"

function greetingForHour(date = new Date()) {
    const hour = date.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
}

export default function Header(props) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(props.userName)

    useEffect(() => {
        setDraft(props.userName)
    }, [props.userName])

    function saveName(event) {
        event.preventDefault()
        props.onUserNameChange(draft)
        setEditing(false)
    }

    return (
        <header className="site-header">
            <div className="brand">
                <img src={chefClaudeLogo} alt="" width="96" height="96" />
                <div>
                    <p className="eyebrow">Pantry to plate</p>
                    <h1>AI cooking assistant</h1>
                    <p className="tagline">Tell me what you have. I’ll write dinner.</p>
                </div>
            </div>
            {editing ? (
                <form className="guest-form" onSubmit={saveName}>
                    <label htmlFor="guest-name">Your name</label>
                    <input
                        id="guest-name"
                        value={draft}
                        maxLength={24}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") setEditing(false)
                        }}
                        autoFocus
                    />
                    <button type="submit">Save</button>
                </form>
            ) : (
                <button type="button" className="guest-badge" onClick={() => setEditing(true)}>
                    <span>{greetingForHour()}</span>
                    <strong>{props.userName}</strong>
                    <span className="guest-edit">Change</span>
                </button>
            )}
        </header>
    )
}
