# AI cooking assistant

## By [Mamadou Moussa Balde](https://www.linkedin.com/in/2mb/)

A Vite React page that drafts a recipe from the ingredients already on the counter. From this folder, `npm start` and `npm run dev` both run Vite. This run was Vite 7.0.6 at http://localhost:5173/. The tab title is **AI cooking assistant**.

The page reads three variables from `.env`. `VITE_GEMINI_API_KEY` is the Gemini key. `VITE_GROQ_API_KEY` is the Groq key. `VITE_LLM` is the Groq model, `openai/gpt-oss-120b`. `.env.example` lists those names. Gemini keys come from [Google AI Studio](https://aistudio.google.com/app/apikey). Groq keys come from [console.groq.com/keys](https://console.groq.com/keys). Vite only sends names that start with `VITE_` into the page, so the app has to be restarted after those values change.

| | |
| --- | --- |
| Deployment | [https://ai-cooking-assistant-c393.onrender.com/](https://ai-cooking-assistant-c393.onrender.com/) |
| Date | October 15, 2026 |
| Release | `67ca9f9` on `main` |

That release is the copy on Render now. It does not include the model switch yet.

## The page

The eyebrow is "Pantry to plate". The heading is "AI cooking assistant" and the line under it is "Tell me what you have. I’ll write dinner." Headings use Fraunces. Body text uses Outfit. The heading is 43.2px, color `rgb(20, 52, 60)`. The page background is `rgb(243, 239, 232)`.

The greeting follows the hour. This morning it read **Good morning**, then the name **Chef**, then **Change**. The name is stored under `chef-gemini-guest`. An empty name falls back to Chef, and the saved name is trimmed to 24 characters.

The pantry starts with Chicken, Oregano, and Tomatoes. The heading was "3 ingredients on hand". Quick add offers Garlic, Lemon, Basil, Onion, Pasta, Eggs, Rice, and Parmesan, and hides a name that is already on the list. The add box placeholder is "e.g. pasta, tomato, cheese".

![The starting page, with three ingredients and the dish form](docs/screenshots/pantry.png)

An empty Add click said "Type an ingredient first." Typing `chicken` and clicking Add said "chicken is already in the pantry." Clicking Garlic changed the heading to "4 ingredients on hand", added Garlic to the numbered list, and said "Garlic added." Garlic left the quick-add row.

![Four ingredients, Comfort, Mexican, the note, and Groq](docs/screenshots/list.png)

Each row has Edit and Remove. The bottom of the pantry panel has **Clear pantry**.

## The dish

The second panel is "What should we cook?" With three ingredients the lead is "The pantry can carry a full dish. Choose a model, a mood, and a cuisine, then I’ll write it." Moods are Chef’s choice, Comfort, Bright, 30 minutes, and For guests. Chef’s choice starts pressed. Cuisines are Any cuisine, African, Mexican, Italian, French, Chinese, Indian, Japanese, Thai, Mediterranean, Middle Eastern, Caribbean, Korean, Spanish, and American. The note placeholder is "e.g. keep it mild, no dairy, serve 4".

Under the note, **Model** offers **Gemini** and **Groq**. Gemini starts pressed. The button reads **Write the recipe**. While it writes, the button says "Writing the recipe…" and the status line reads "Reading the pantry". The mood buttons, cuisine menu, note, and model buttons are disabled during that time.

## The recipe

Gemini calls `gemini-2.5-flash`. Groq uses `groq-sdk` and `groq.chat.completions.create` with the model in `VITE_LLM`.

This run set Comfort, Mexican, the note `keep it mild, serve 4`, and Groq. The reply is **Mild Mexican Chicken Tomato Skillet**. The line under the toolbar is `Built from Chicken, Oregano, Tomatoes, Garlic · Groq · Mexican · “keep it mild, serve 4”`. The opening sentence is "A warm, comforting Mexican-style skillet that makes perfect use of your chicken, oregano, tomatoes and garlic while staying gentle on the heat." It lists **Time:** 25 minutes and **Serves:** 4, then Ingredients, Method, and a Chef's note. The toolbar says ON THE PLATE, **Copy recipe**, and **Start over**. The recipe is written under the dish form.

![Mild Mexican Chicken Tomato Skillet, written by Groq](docs/screenshots/recipe.png)

`@google/generative-ai` is the Gemini client. `groq-sdk` is the Groq client. `@anthropic-ai/sdk` and `@huggingface/inference` are installed, and this page does not call them.
