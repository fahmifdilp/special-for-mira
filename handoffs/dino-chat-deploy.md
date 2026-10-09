# Dino AI Chat Deploy
Status: DITUNDA · Service: Vercel `special-for-mira` · Diperbarui: 2026-10-09

## Sedang dikerjakan
Menunggu owner me-revoke/rotate kredensial yang pernah tertulis di chat, lalu menambahkan kredensial baru langsung ke Vercel Environment Variables.

## Status terakhir (apa yang sudah terbukti / sudah deploy)
- Dino Dengerin UI, session-only history, concise persona, and visible consent share UI deployed in commit `b7972bf`.
- Vercel production is `https://special-for-mira.vercel.app/`; latest deployment is Ready.
- `/api/dino-chat` and `/api/share-chat` are deployed and return expected `503` while env vars are absent.
- `npm.cmd run lint`, `npm.cmd run build`, and both API syntax checks pass.

## Keputusan penting
- Never put API or Telegram secrets in source, `.env` tracked files, browser code, or chat logs.
- Normal chat never forwards messages. Telegram share requires a visible checkbox and button in the Mira-facing UI.
- Chat history stays in React memory and resets on reload/tab close.

## Langkah berikutnya
1. Revoke the exposed adaCODE key and Telegram bot token; create replacements.
2. Run `vercel env add ADACODE_API_KEY production` and enter the replacement locally at the prompt.
3. Optionally add `ADACODE_MODEL=adacode-2.5-flash` for Production.
4. If Mira explicitly opts in to sharing, add replacement `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in Vercel; otherwise leave them unset.
5. Redeploy with `vercel --prod` and POST-test `/api/dino-chat` without printing the response secret.

## Jangan lakukan (jebakan yang sudah ditemukan)
- Do not reuse either credential pasted in the conversation.
- Do not add a background Telegram call or hide the consent UI.
