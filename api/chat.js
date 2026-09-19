// Talkora — Vercel Node Function: POST /api/chat
// Serverless port of the /api/chat route in server.js (which is for local dev).
// Default provider is FREE and keyless: Pollinations (https://text.pollinations.ai).

const FREE_MODELS = new Set(['openai', 'gpt-oss-20b']); // verified anonymous allow-list

async function callPollinations(messages, model) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const r = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'gpt-oss-20b',
          messages,
          reasoning_effort: 'low',
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!r.ok) throw new Error('Pollinations HTTP ' + r.status);
      const j = await r.json();
      const c = j && j.choices && j.choices[0];
      const text = c && (c.message ? c.message.content : c.content);
      if (text) return text; // sometimes reasoning-only with no content → retry
    } catch (e) { /* one retry */ }
  }
  return null;
}

async function callKeyed(url, key, model, messages, maxTokens) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
    signal: ctrl.signal,
  });
  clearTimeout(timer);
  if (!r.ok) {
    let detail = 'HTTP ' + r.status;
    try { const j = await r.json(); detail += ' — ' + ((j.error && j.error.message) || JSON.stringify(j)).slice(0, 300); } catch (e) {}
    throw new Error(detail);
  }
  const j = await r.json();
  return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
}

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'POST, OPTIONS'); return res.status(204).end(); }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST' });
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { return res.status(400).json({ ok: false, error: 'Bad JSON' }); } }
  const provider = String(b.provider || 'openai');
  const key = String(b.key || '').trim();
  let model = String(b.model || '').trim();
  const messages = b.messages;
  const maxTokens = Math.min(2000, parseInt(b.max_tokens, 10) || 900);
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ ok: false, error: 'messages[] is required' });

  try {
    if (provider === 'pollinations') {
      if (!FREE_MODELS.has(model)) model = 'gpt-oss-20b'; // anonymous tier: enforced allow-list
      const text = await callPollinations(messages, model);
      if (!text) return res.status(502).json({ ok: false, error: 'Free AI is busy right now — try again in a few seconds.' });
      return res.status(200).json({ ok: true, text });
    }
    if (!key) return res.status(400).json({ ok: false, error: 'This provider needs an API key. Switch provider to "pollinations (free)" to use Talkora with no key.' });
    let url;
    if (provider === 'openai') url = 'https://api.openai.com/v1/chat/completions';
    else if (provider === 'groq') url = 'https://api.groq.com/openai/v1/chat/completions';
    else if (provider === 'openrouter') url = 'https://openrouter.ai/api/v1/chat/completions';
    else if (provider === 'custom') {
      url = String(b.url || '').trim();
      if (!/^https:\/\//.test(url)) return res.status(400).json({ ok: false, error: 'Custom provider needs an https:// Chat Completions URL' });
    } else return res.status(400).json({ ok: false, error: 'Unknown provider' });
    if (!model) return res.status(400).json({ ok: false, error: 'Enter a model name for this provider' });
    const text = await callKeyed(url, key, model, messages, maxTokens);
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/abort/i.test(msg)) return res.status(504).json({ ok: false, error: 'AI request timed out' });
    return res.status(502).json({ ok: false, error: msg.slice(0, 400) });
  }
}
