# AI cooking assistant

## By [Mamadou Moussa Balde](https://www.linkedin.com/in/2mb/)

A Vite React page that drafts a recipe from the ingredients already on the counter. From this folder, `npm start` and `npm run dev` both run Vite. This run was Vite 7.0.6 at http://localhost:5173/. The tab title is **AI cooking assistant**. The page reads `VITE_GEMINI_API_KEY`. `.env.example` shows that name and points to [Google AI Studio](https://aistudio.google.com/app/apikey) for a key.

## The page

The eyebrow is "Pantry to plate". The heading is "AI cooking assistant" and the line under it is "Tell me what you have. I’ll write dinner." Headings use Fraunces. Body text uses Outfit. The heading is 43.2px, color `rgb(20, 52, 60)`. The page background is `rgb(243, 239, 232)`.

The greeting follows the hour. This evening it read **Good evening**, then the name **Chef**, then **Change**. The name is stored under `chef-gemini-guest`. An empty name falls back to Chef, and the saved name is trimmed to 24 characters.

The pantry starts with Chicken, Oregano, and Tomatoes. The heading was "3 ingredients on hand". Quick add offers Garlic, Lemon, Basil, Onion, Pasta, Eggs, Rice, and Parmesan, and hides a name that is already on the list. The add box placeholder is "e.g. pasta, tomato, cheese".

![The starting page, with three ingredients and the dish form](docs/screenshots/pantry.png)

An empty Add click said "Type an ingredient first." Typing `chicken` and clicking Add said "chicken is already in the pantry." Clicking Garlic changed the heading to "4 ingredients on hand", added Garlic to the numbered list, and said "Garlic added." Garlic left the quick-add row.

![Four ingredients, Comfort, Mexican, and the note](docs/screenshots/list.png)

Each row has Edit and Remove. The bottom of the pantry panel has **Clear pantry**.

## The dish

The second panel is "What should we cook?" With three ingredients the lead is "The pantry can carry a full dish. Choose a mood and a cuisine, then I’ll write it." Moods are Chef’s choice, Comfort, Bright, 30 minutes, and For guests. Chef’s choice starts pressed. Cuisines are Any cuisine, African, Mexican, Italian, French, Chinese, Indian, Japanese, Thai, Mediterranean, Middle Eastern, Caribbean, Korean, Spanish, and American. The note placeholder is "e.g. keep it mild, no dairy, serve 4". The button reads **Write the recipe**.

This run set Comfort, Mexican, and the note `keep it mild, serve 4`. The button became "Writing the recipe…" and the status line read "Reading the pantry". The mood buttons, cuisine menu, and note were disabled while it wrote.

## The recipe

The model is `gemini-2.5-flash`. The reply came back as **Pollo Estofado con Tomate y Ajo (Mild Mexican Chicken Stew with Tomato and Garlic)**. The line under the toolbar is `Built from Chicken, Oregano, Tomatoes, Garlic · Mexican · “keep it mild, serve 4”`. The opening sentence is "This comforting, mild Mexican-inspired chicken stew comes together beautifully with your pantry staples for a warm, familiar meal." It lists **Time:** 35 minutes and **Serves:** 4, then Ingredients, Method, and a Chef's note. The toolbar says ON THE PLATE, **Copy recipe**, and **Start over**. The recipe is written under the dish form.

![The mild Mexican chicken stew written under the dish form](docs/screenshots/recipe.png)

The footer says "Recipes are drafted by Gemini from whatever is already in the kitchen." and links **Mamadou Moussa Balde** to the same LinkedIn profile. This run showed © 2026.

`@google/generative-ai` is the client the page calls. `@anthropic-ai/sdk` and `@huggingface/inference` are installed, and this page does not call them.
