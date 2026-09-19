/* Talkora — multilingual voice learning app (EN · TA · HI · ML · FR)
   Zero-dependency Node server: static app + translation proxy + LLM chat proxy.
   Run: node server.js  →  http://localhost:3000
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const LANGMAP = { en: 'EN', ta: 'TA', hi: 'HI', ml: 'ML', fr: 'FR' };

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

async function callLLM(provider, key, model, messages, maxTokens) {
  if (provider === 'pollinations' || provider === 'free') {
    // Keyless free tier: open-weight model (gpt-oss-20b) via Pollinations.
    // Slower than key-backed APIs (15-40 s typical) and occasionally rate-limited.
    // reasoning_effort low keeps it fast and stops it from burning the token budget
    // on reasoning; one automatic retry if the model comes back with no content.
    const FREE_MODELS = ['openai', 'gpt-oss-20b']; // only names the keyless API accepts
    const body = {
      model: (model && FREE_MODELS.includes(model)) ? model : 'gpt-oss-20b',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      reasoning_effort: 'low',
    };
    let text = '';
    for (let attempt = 1; attempt <= 2 && !text; attempt++) {
      const r = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(100000),
      });
      const j = await r.json().catch(() => ({}));
      if (j.error) throw new Error(typeof j.error === 'string' ? j.error.slice(0, 200) : (j.error.message || 'free engine error'));
      if (!r.ok && j.message) throw new Error(j.message.slice(0, 160));
      text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
      if (!text) console.warn(`[ai] free engine attempt ${attempt} had no content — retrying...`);
    }
    if (!text) throw new Error('free engine returned no text');
    return text;
  }
  if (provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    return j.choices[0].message.content;
  }
  if (provider === 'anthropic') {
    const sys = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const rest = messages.filter(m => m.role !== 'system');
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: model || 'claude-3-5-haiku-latest', max_tokens: maxTokens, system: sys, messages: rest }),
      signal: AbortSignal.timeout(30000),
    });
    const j = await r.json();
    if (j.type === 'error') throw new Error(j.error.message);
    return j.content.map(p => p.text || '').join('');
  }
  if (provider === 'gemini') {
    const m = model || 'gemini-2.0-flash';
    const sys = messages.filter(x => x.role === 'system').map(x => x.content).join('\n');
    const contents = messages
      .filter(x => x.role !== 'system')
      .map(x => ({ role: x.role === 'assistant' ? 'model' : 'user', parts: [{ text: x.content }] }));
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents }),
      signal: AbortSignal.timeout(30000),
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    return j.candidates[0].content.parts.map(p => p.text || '').join('');
  }
  throw new Error('unknown provider: ' + provider);
}

const server = http.createServer((req, res) => {
  let u;
  try { u = new URL(req.url, 'http://localhost'); }
  catch { return json(res, 400, { ok: false, error: 'bad url' }); }

  if (u.pathname === '/api/health') {
    return json(res, 200, { ok: true, app: 'talkora', langs: Object.keys(LANGMAP), time: new Date().toISOString() });
  }

  /* ---- translation proxy (MyMemory, free, no key) ---- */
  if (u.pathname === '/api/translate' && (req.method === 'GET' || req.method === 'POST')) {
    let q = u.searchParams.get('q') || '';
    let from = (u.searchParams.get('from') || 'en').toLowerCase();
    let to = (u.searchParams.get('to') || 'ta').toLowerCase();
    if (!q && req.method === 'POST') {
      let body = '';
      req.on('data', c => { body += c; if (body.length > 8000) req.destroy(); });
      req.on('end', () => {
        try {
          const j = JSON.parse(body || '{}');
          q = j.q || ''; from = (j.from || 'en').toLowerCase(); to = (j.to || 'ta').toLowerCase();
          doTranslate(q, from, to, res);
        } catch { return json(res, 400, { ok: false, error: 'bad json' }); }
      });
      return;
    }
    return doTranslate(q, from, to, res);
  }

  /* ---- AI tutor proxy (user's own API key, forwarded securely) ---- */
  if (u.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 200000) req.destroy(); });
    req.on('end', async () => {
      try {
        const j = JSON.parse(body || '{}');
        const { provider = 'openai', key = '', model = '', messages = [], max_tokens = 700 } = j;
        const freeProvider = provider === 'pollinations' || provider === 'free';
        if ((!key && !freeProvider) || !Array.isArray(messages) || !messages.length) {
          return json(res, 400, { ok: false, error: 'key and messages are required' });
        }
        const text = await callLLM(provider, key, model, messages, max_tokens);
        return json(res, 200, { ok: true, text });
      } catch (e) {
        return json(res, 502, { ok: false, error: String((e && e.message) || e) });
      }
    });
    return;
  }

  /* ---- static files ---- */
  let p = u.pathname === '/' ? '/index.html' : u.pathname;
  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webmanifest': 'application/manifest+json; charset=utf-8',
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

function doTranslate(q, from, to, res) {
  q = String(q || '').trim();
  if (!q) return json(res, 400, { ok: false, error: 'q is required' });
  if (q.length > 500) return json(res, 400, { ok: false, error: 'max 500 chars' });
  const src = LANGMAP[from] || 'EN';
  const dst = LANGMAP[to] || 'EN';
  // Fallback variants dodge MyMemory's poisoned-empty TM segments (empirically
  // the base form sometimes returns an empty translation while a variant doesn't)
  const cands = [q];
  if (!/[.!?,।؟]$/.test(q)) cands.push(q + '.');
  cands.push(q.toUpperCase());
  const tryNext = (i) => {
    if (i >= cands.length) return json(res, 502, { ok: false, error: 'no result from translation engine' });
    const api = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cands[i])}&langpair=${src}|${dst}`;
    fetch(api, { signal: AbortSignal.timeout(9000) })
      .then(r => r.json())
      .then(j => {
        let t = (j && j.responseData && j.responseData.translatedText) || '';
        if (!String(t).trim() && j && Array.isArray(j.matches) && j.matches[0] && j.matches[0].translation) {
          t = j.matches[0].translation; // TM entry with a usable translation
        }
        if (String(t).trim()) {
          return json(res, 200, { ok: true, text: String(t).trim(), match: (j && j.responseData && j.responseData.match) || 0, online: true });
        }
        tryNext(i + 1);
      })
      .catch(e => json(res, 502, { ok: false, error: String((e && e.message) || e) }));
  };
  tryNext(0);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Talkora running: http://0.0.0.0:${PORT}  (en · ta · hi · ml · fr)`);
});
