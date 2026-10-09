# Dino Break for Mira

An original little React/Vite game page made for Mira, who deserves a few minutes of nonsense. It is bright, silly, low-pressure, and intentionally not a romantic letter.

## Run locally

```bash
npm install
npm run dev
```

On Windows PowerShell machines where script execution is restricted, use:

```bash
npm.cmd run dev
```

Production checks:

```bash
npm.cmd run lint
npm.cmd run build
```

## Personalize it

Most copy lives in [`src/data/content.js`](src/data/content.js). Update:

- `person.nickname` and `person.name`
- dino speech lines and jokes
- Dash, snack, mood, and fact-machine messages
- Bubble Break / Pop the Stress copy in `bubbles`, especially `bubbles.bubbles`
- the final note and easter egg text
- `content.music.source` if you want to swap the included `public/audio/dino-daydream.wav` loop

The dino illustration is an inline SVG in [`src/App.jsx`](src/App.jsx), so it does not require an external image or backend.

### Change Bubble Break

Bubble Break (also labelled "Pop the Stress") gets its bubbles from `content.bubbles.bubbles` in [`src/data/content.js`](src/data/content.js). Edit each bubble's `label` (what appears inside it) and `reaction` (the small response shown after it pops). Keep every `id` unique; you can change the existing `tone` values to vary the color treatment.

```js
{
  id: 'email',
  label: 'email yang belum dibalas',
  reaction: 'Nanti saja. Kamu manusia, bukan inbox.',
  tone: 'coral',
}
```

Use the Bubble Break `Isi gelembung lagi` button after all bubbles are popped to refill only that game. Use the final `Main lagi` control to restart the entire experience from the opening screen.

## What is inside

- Animated dino opening screen with clouds, hills, stars, and speech bubble
- Short generated dino boing sound when the opening button is clicked (browser-safe, no autoplay)
- Tap-the-dino reactions and status changes
- Dino Dash: a small jump game with score and win state
- Bubble Break / Pop the Stress: pop floating bubbles to clear a few tiny worries
- Snack Station: feed the dino five times
- Mood cards with funny responses
- Dino Dengerin: concise AI companion chat with per-tab history
- Dino Disco with selectable Wiggle, Muter, and Zoomies dance moves
- Random dino fact machine
- Original playful `dino-daydream.wav` background loop starts after the opening click and can be muted with the Music button
- Three easter eggs: five logo clicks, the `dino` keyboard sequence, and a hidden star
- Responsive mobile layout and reduced-motion fallback

## Run the private AI chat locally

The Dino chat is configured for a local 9Router-compatible endpoint so conversations stay on the machine running 9Router. Copy [`.env.example`](.env.example) to `.env.local`, then fill in a newly rotated key locally:

```bash
ADACODE_BASE_URL=http://localhost:20128/v1
ADACODE_API_KEY=your_rotated_9router_key
ADACODE_MODEL=cx/gpt-5.6-terra
```

Run the Vercel development server so the `/api/dino-chat` function is available:

```bash
npm.cmd exec --yes --package=vercel@63.1.0 -- vercel dev
```

The chat API accepts short, in-page history and returns only a Dino reply. It does not persist, forward, or send conversations anywhere else. A normal `npm.cmd run dev` serves the static UI but does not run the Vercel function.

## Deploy the static experience

The production URL is `https://special-for-mira.vercel.app/`. Vercel cannot reach `localhost` on your computer, so the deployed page intentionally cannot use your private 9Router endpoint. To use AI online, you would need a deliberately exposed, secured OpenAI-compatible endpoint and a new Vercel environment configuration; keep the local setup if privacy is the priority.

The same build can be hosted on Netlify or GitHub Pages. `vite.config.js` uses a relative base for static hosting.

## Reference research

The implementation is original. These open-source projects were checked for motion and interaction patterns:

- [motiondivision/motion](https://github.com/motiondivision/motion) - MIT animation library for React.
- [lucide-icons/lucide](https://github.com/lucide-icons/lucide) - open-source icon toolkit used through `lucide-react`.
- [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) - MIT particle patterns; this project uses lightweight CSS decorations instead.
