import { useState } from "react"
import Header from "./Header"
import Main from "./Main"

const GUEST_KEY = "chef-gemini-guest"

function readGuestName() {
    try {
        return localStorage.getItem(GUEST_KEY) || "Chef"
    } catch {
        return "Chef"
    }
}

export default function App() {
    const [userName, setUserName] = useState(readGuestName)

    function updateUserName(name) {
        const next = name.trim().slice(0, 24) || "Chef"
        setUserName(next)
        try {
            localStorage.setItem(GUEST_KEY, next)
        } catch {
            // The greeting still updates for this visit if storage is blocked.
        }
    }

    return (
        <div className="page">
            <Header userName={userName} onUserNameChange={updateUserName} />
            <Main userName={userName} />
            <footer className="site-footer">
                <p>Recipes are drafted by Gemini or Groq from whatever is already in the kitchen.</p>
                <p className="copyright">
                    © {new Date().getFullYear()}{" "}
                    <a href="https://www.linkedin.com/in/2mb" target="_blank" rel="noreferrer">
                        Mamadou Moussa Balde
                    </a>
                </p>
            </footer>
        </div>
    )
}
