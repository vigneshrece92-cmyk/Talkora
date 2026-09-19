// Talkora — Vercel Node Function: GET /api/translate?q=..&from=..&to=..
// Serverless port of the /api/translate route in server.js (MyMemory, no key).
// The UI falls back to its offline dictionary when this returns ok:false.

const UA = 'Mozilla/5.0 (compatible; TalkoraApp/3.0)';

export const config = { maxDuration: 30 };

async function myMemory(q, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(from + '|' + to)}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const j = await r.json();
    const t = j && j.responseData && j.responseData.translatedText;
    if (!t || /QUERY LENGTH LIMIT|INVALID|NO QUERY/i.test(t)) return null;
    return t;
  } catch (e) { return null; }
}

// poisoned-TM defense: try query variants until a translation comes back
const VARIANTS = (q) => [q, q + '.', 'please: ' + q, q + ' now'];

export default async function handler(req, res) {
  const q = String(req.query.q || '').trim();
  const from = String(req.query.from || 'en').toLowerCase();
  const to = String(req.query.to || 'ta').toLowerCase();
  if (!q) return res.status(400).json({ ok: false, error: 'Missing ?q=' });
  const started = Date.now();
  for (const v of VARIANTS(q)) {
    if (Date.now() - started > 9000) break; // stay inside the function budget
    const hit = await myMemory(v, from, to);
    if (hit) return res.status(200).json({ ok: true, text: hit, match: 'online', online: true });
  }
  return res.status(200).json({ ok: false, online: false });
}
