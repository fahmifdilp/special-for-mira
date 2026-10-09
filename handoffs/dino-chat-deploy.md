# Dino AI Chat Deploy
Status: DITUNDA · Service: Vercel `special-for-mira` · Diperbarui: 2026-10-09

## Sedang dikerjakan
Menunggu owner me-revoke/rotate kredensial yang pernah tertulis di chat, lalu menambahkan key baru ke `.env.local` untuk 9Router lokal.

## Status terakhir (apa yang sudah terbukti / sudah deploy)
- Dino Dengerin UI, session-only history, concise persona, and no-sharing privacy flow are deployed.
- Vercel production is `https://special-for-mira.vercel.app/`; latest deployment is Ready.
- `/api/dino-chat` is deployed and returns expected `503` while local credentials are absent.
- `npm.cmd run lint`, `npm.cmd run build`, and both API syntax checks pass.

## Keputusan penting
- Never put API secrets in source, `.env` tracked files, browser code, or chat logs.
- Normal chat never forwards or shares messages with anyone.
- Chat history stays in React memory and resets on reload/tab close.

## Langkah berikutnya
1. Revoke the exposed adaCODE/9Router key; create a replacement.
2. Copy `.env.example` to `.env.local` and set `ADACODE_BASE_URL=http://localhost:20128/v1`, the replacement key, and `ADACODE_MODEL=cx/gpt-5.6-terra` (or another ID shown by `/v1/models`).
3. Run `npm.cmd exec --yes --package=vercel@63.1.0 -- vercel dev` while 9Router is running.
4. POST-test `/api/dino-chat` locally without printing the response secret.

## Jangan lakukan (jebakan yang sudah ditemukan)
- Do not reuse the credential pasted in the conversation.
- Do not add external forwarding or any hidden sharing path.
- Do not set a `localhost` API URL in Vercel and expect it to reach the owner's computer.
