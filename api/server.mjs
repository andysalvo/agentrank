// AgentRank API — serves the public index. Zero dependencies (Node http).
// Reads a rankings.json produced by the (private) ranking kernel and exposes
// the index as views: /index, /top, /v1/rank/{address}, /score/{address}.
//
//   PORT=8120 RANKINGS=/path/to/rankings.json node api/server.mjs

import { createServer } from 'http';
import { readFileSync } from 'fs';

const PORT = Number(process.env.PORT || 8120);
const FILE = process.env.RANKINGS || '/home/andy/agentrank/rankings.json';
const SEEDS_FILE = process.env.SEEDS || '/home/andy/agentrank/seeds.json';
const INTEL_FILE = process.env.INTEL || '/home/andy/agentrank/intel.json';
const REPO = 'https://github.com/andysalvo/agentrank';

let DB = { agents: [] }, IDX = new Map(), SEEDS = null, INTEL = null;
const readMaybe = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
function reload() {
  try { DB = JSON.parse(readFileSync(FILE, 'utf8')); } catch { DB = { agents: [] }; }
  IDX = new Map(DB.agents.map((a) => [a.address.toLowerCase(), a]));
  SEEDS = readMaybe(SEEDS_FILE);
  INTEL = readMaybe(INTEL_FILE);
}
reload();
setInterval(reload, 60_000);

const json = (res, code, obj) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=60',
  });
  res.end(JSON.stringify(obj));
};

createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*' }); return res.end(); }
  const u = new URL(req.url, 'http://x');
  const p = u.pathname.replace(/\/+$/, '') || '/';
  const limit = Math.min(Number(u.searchParams.get('limit')) || 50, 500);

  if (p === '/' || p === '/v1') {
    return json(res, 200, {
      name: DB.name || 'AgentRank', tagline: DB.tagline || 'The public index of AI agents.',
      generated_at: DB.generated_at, coverage: DB.coverage, params: DB.params,
      endpoints: { index: '/index?limit=50&role=service', top: '/top?limit=20', rank: '/v1/rank/{address}', score: '/score/{address}', seeds: '/seeds', intel: '/intel', intel_section: '/intel/{ecosystem|top|newest|most_reviewed|disputed|growing}', methodology: REPO + '/blob/main/METHODOLOGY.md' },
      publisher: DB.publisher || 'Crest Deployment Systems LLC', repo: REPO,
    });
  }
  if (p === '/health') return json(res, 200, { ok: true, agents: DB.agents.length, generated_at: DB.generated_at, has_intel: !!INTEL, has_seeds: !!SEEDS });
  if (p === '/methodology') { res.writeHead(302, { Location: REPO + '/blob/main/METHODOLOGY.md' }); return res.end(); }

  // the root of trust (the verified-real anchor set)
  if (p === '/seeds') return json(res, 200, SEEDS || { note: 'seed set not yet published' });

  // the intelligence layer (higher-order signals over the moat corpus)
  if (p === '/intel') return json(res, 200, INTEL || { note: 'intel not yet computed' });
  const im = p.match(/^\/intel\/(ecosystem|top|newest|most_reviewed|disputed|growing)$/);
  if (im) {
    if (!INTEL) return json(res, 200, { note: 'intel not yet computed' });
    return json(res, 200, { generated_at: INTEL.generated_at, coverage: INTEL.coverage, [im[1]]: INTEL[im[1]] });
  }

  if (p === '/index' || p === '/rankings' || p === '/top') {
    const role = u.searchParams.get('role');
    let list = DB.agents;
    if (role && p !== '/top') list = list.filter((a) => a.role === role);
    return json(res, 200, { generated_at: DB.generated_at, count: list.length, agents: list.slice(0, p === '/top' ? Math.min(limit, 20) || 20 : limit) });
  }

  const m = p.match(/^\/(v1\/rank|score)\/(0x[a-fA-F0-9]{40})$/);
  if (m) {
    const a = IDX.get(m[2].toLowerCase());
    if (!a) return json(res, 200, { address: m[2].toLowerCase(), found: false, note: 'Not in the current AgentRank index: no observed settlement activity, or below coverage.' });
    if (m[1] === 'score') return json(res, 200, { address: a.address, score: a.score, percentile: a.percentile, rank: a.rank, found: true, generated_at: DB.generated_at });
    return json(res, 200, { found: true, ...a, generated_at: DB.generated_at });
  }

  json(res, 404, { error: 'not found', endpoints: ['/', '/index', '/top', '/v1/rank/{address}', '/score/{address}', '/methodology'] });
}).listen(PORT, '127.0.0.1', () => console.log('agentrank-api on :' + PORT + ' serving ' + FILE));
