// Faux Firebase Realtime Database : GET (JSON ou flux SSE), PUT, PATCH, DELETE ; journal des écritures
const http = require('http');
const fs = require('fs');
const PORT = +process.argv[2] || 8790;
const JOURNAL = process.argv[3] || '/home/claude/tests/fakefb_journal.jsonl';
fs.writeFileSync(JOURNAL, '');
let racine = {};
const clients = [];
const parts = (u) => decodeURIComponent(u.split('?')[0]).replace(/\.json$/, '').split('/').filter(Boolean);
function lire(p) { let o = racine; for (const k of p) { if (!o || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; }
function ecrire(p, v) {
  if (!p.length) { racine = v || {}; return; }
  let o = racine;
  for (const k of p.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  if (v === null) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = v;
}
function diffuser(p, ev, data) {
  for (const c of clients) {
    const cp = c.p;
    if (p.slice(0, cp.length).join('/') !== cp.join('/')) continue;
    const rel = '/' + p.slice(cp.length).join('/');
    c.res.write(`event: ${ev}\ndata: ${JSON.stringify({ path: rel, data })}\n\n`);
  }
}
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const p = parts(req.url);
  if (req.url === '/__racine') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(racine)); }
  if (req.method === 'GET') {
    if ((req.headers.accept || '').includes('text/event-stream')) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(`event: put\ndata: ${JSON.stringify({ path: '/', data: lire(p) })}\n\n`);
      const c = { p, res }; clients.push(c);
      const t = setInterval(() => res.write('event: keep-alive\ndata: null\n\n'), 15000);
      req.on('close', () => { clearInterval(t); clients.splice(clients.indexOf(c), 1); });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(lire(p)));
  }
  let corps = '';
  req.on('data', d => corps += d);
  req.on('end', () => {
    let v = null; try { v = corps ? JSON.parse(corps) : null; } catch (e) { res.writeHead(400); return res.end('{}'); }
    fs.appendFileSync(JOURNAL, JSON.stringify({ m: req.method, p: p.join('/'), cles: v && typeof v === 'object' ? Object.keys(v) : null, corps: corps.slice(0, 4000) }) + '\n');
    if (req.method === 'PATCH') { for (const [k, x] of Object.entries(v || {})) ecrire(p.concat(k.split('/').filter(Boolean)), x); diffuser(p, 'patch', v); }
    else if (req.method === 'PUT') { ecrire(p, v); diffuser(p, 'put', v); }
    else if (req.method === 'DELETE') { ecrire(p, null); diffuser(p, 'put', null); }
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(v));
  });
}).listen(PORT, () => console.log('fakefb ' + PORT));
