# 🗣️ Talkora — learn 5 languages by voice

**வணக்கம் · नमस्ते · നമസ്കാരം · Bonjour · Hello!** Talkora is a voice-first language
coach that runs entirely in your browser. Learn any pair between **English, Tamil (தமிழ்),
Hindi (हिंदी), Malayalam (മലയാളം) and French (français)**. It works offline, keeps every
bit of progress on your device, and the AI tutor runs **completely free with no API key**
(Pollinations).

📱 **Installable PWA** — add it to your phone home screen and it opens full-screen like a
native app.

## Highlights

- 🎙️ **Voice-first** — every word/phrase is spoken with native voices; speak back to score your pronunciation (Word / Shadowing / Dictation modes)
- 🧠 **Core learning** — curated dictionary + offline intents, levels & XP, streaks + daily goals
- 📝 **Practice** — mistake book, SM-2 spaced repetition, quizzes (unscramble, cloze, type, read-aloud, listening) + AI quizzes, 12 badges
- 🔤 **Script Trainer** — learn Tamil / Devanagari / Malayalam alphabets with voiced letter cards, known-tracking and letter quizzes
- 🤖 **AI tutor (free)** — conversations at levels A1–B2, interactive stories with choices, session reviews, grammar feedback. Default provider Pollinations `gpt-oss-20b` — **no key needed**
- 💾 **Private** — everything lives in your browser's localStorage; JSON backup / restore / wipe
- 📶 **Offline** — the service worker caches the whole app shell; machine translation is only used online for unseen sentences

## Project layout

| Path | What it is |
|---|---|
| `index.html` | The entire app (single file: UI + data + logic) |
| `manifest.webmanifest`, `sw.js`, icons | Installable-PWA pieces |
| `api/chat.js` | Vercel Function — AI chat proxy (free Pollinations default, or OpenAI / Groq / OpenRouter / custom with a key) |
| `api/translate.js` | Vercel Function — sentence translation via MyMemory (no key) |
| `server.js` | The same two API routes as a local zero-dependency Node server (for local dev — not used on Vercel) |

## 🚀 Deploy your own (Vercel, free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvigneshrece92-cmyk%2FTalkora)

Or manually:

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project** → import `vigneshrece92-cmyk/Talkora`.
3. Nothing to configure: Framework Preset **Other**, leave Build/Output empty. Press **Deploy**.
4. You get a URL like `https://talkora.vercel.app` — rename it under **Settings → Domains**,
   or attach your own domain there.

Every push to GitHub redeploys automatically.

## Run locally

```bash
node server.js     # → http://localhost:3000
```

(Node 20+, zero dependencies.)

## Notes

- Progress is stored under localStorage key `talkora_v2` (older `vazhakam_v2` data is migrated automatically; old backups still import).
- On-device voices cover ta / hi / ml / en; French falls back to online TTS when no fr voice is installed.
- If the free AI is rate-limited, wait ~30 s and retry — or plug in any OpenAI-compatible key under Settings → AI Coach.
