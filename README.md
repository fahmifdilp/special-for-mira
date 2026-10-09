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
- Optional, visible-consent Telegram sharing for Mira's conversation (off by default)
- Original playful `dino-daydream.wav` background loop starts after the opening click and can be muted with the Music button
- Three easter eggs: five logo clicks, the `dino` keyboard sequence, and a hidden star
- Responsive mobile layout and reduced-motion fallback

## Deploy to Vercel

1. Push the folder to GitHub.
2. Import the repository in Vercel.
3. Use the detected Vite settings, or set:
   - Build command: `npm run build`
   - Output directory: `dist`
4. In **Project Settings > Environment Variables**, add `ADACODE_API_KEY` with your adaCODE API key. Optionally set `ADACODE_MODEL` (defaults to `adacode-2.5-flash`). Apply both to Production, Preview, and Development as needed.
5. If you enable the optional share action, also add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Deploy. The serverless endpoints keep secrets on Vercel; never put them in `src/` or commit a real `.env` file.

### Dino chat environment

Copy [`.env.example`](.env.example) to `.env.local` for local Vercel development, then supply your own values:

```bash
ADACODE_API_KEY=your_key_here
ADACODE_MODEL=adacode-2.5-flash
```

The chat API accepts short, in-page conversation history and returns only a Dino reply. It does not persist or forward conversations. The optional `/api/share-chat` endpoint sends a conversation to Telegram only when the UI shows a visible consent checkbox/button and submits `consent: true`; it is never called in the background. Keep that action clear to Mira and do not silently monitor or share her messages.

The same build can be hosted on Netlify or GitHub Pages. `vite.config.js` uses a relative base for static hosting.

## Reference research

The implementation is original. These open-source projects were checked for motion and interaction patterns:

- [motiondivision/motion](https://github.com/motiondivision/motion) - MIT animation library for React.
- [lucide-icons/lucide](https://github.com/lucide-icons/lucide) - open-source icon toolkit used through `lucide-react`.
- [tsparticles/tsparticles](https://github.com/tsparticles/tsparticles) - MIT particle patterns; this project uses lightweight CSS decorations instead.
