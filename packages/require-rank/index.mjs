// require-rank — gate your agent by the CALLER's AgentRank.
//
// The provider-side flip. Verify-before-pay (the crowded gate) is the PAYER asking "is this safe to pay".
// requireRank is the PROVIDER asking "does this caller have a rank before I do work for it". A service
// agent wraps its MCP tools (or any handler): ranked callers are served, ghosts/unranked are refused or
// surcharged — and the refusal tells them how to get ranked, which funnels them to AgentRank. Every
// check is a live query, so the rank is exercised in the hot path of real work (never a dead directory).
//
// Zero dependencies. Works with the MCP SDK's (args, extra) tool handlers or any function.
//
//   import { requireRank } from "require-rank";
//   server.tool("expensive_thing", schema, requireRank(handler, { minScore: 500 }));

const API = "https://api.agentrank.info";
const SITE = "https://agentrank.info";
const isWallet = (s) => /^0x[a-f0-9]{40}$/i.test(s || "");

// Resolve a caller's AgentRank (verified + settlement-grounded score 0-1000).
export async function resolveRank(key, { api = API, timeoutMs = 5000 } = {}) {
  try {
    const r = await fetch(`${api}/resolve/${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: "application/json" } });
    if (!r.ok) return { verified: false, score: 0, verdict: `agentrank unavailable (${r.status})`, unknown: true };
    const j = await r.json();
    return { verified: !!j.verified, score: j.score || 0, settlement: j.settlement || null, verdict: j.verdict, unknown: false };
  } catch (e) { return { verified: false, score: 0, verdict: `agentrank unreachable: ${e.message}`, unknown: true }; }
}

function cta(key, rank) {
  return `Caller ${key || "(unknown)"} is ${rank.verified ? `ranked ${rank.score}/1000` : "unranked"} on AgentRank. To access this agent, claim your identity and settle real value: ${SITE} — check your standing: ${API}/resolve/${encodeURIComponent(key || "")}`;
}

// A reusable gate. policy: { minScore, requireVerified, onFail, surchargeX, api, allowUnknown }.
//   onFail: "refuse" (default) | "surcharge" | "allow"
export class RankGate {
  constructor(policy = {}) {
    this.p = { minScore: 0, requireVerified: true, onFail: "refuse", surchargeX: 3, allowUnknown: false, api: API, ...policy };
  }
  async check(callerKey) {
    const p = this.p;
    if (!callerKey) return { allow: p.onFail === "allow", rank: null, reason: "no caller identity presented", surcharge: 1, cta: cta(null, { verified: false, score: 0 }) };
    const rank = await resolveRank(callerKey, { api: p.api });
    if (rank.unknown && p.allowUnknown) return { allow: true, rank, reason: "agentrank unavailable, allowed by policy", surcharge: 1 };
    const meets = (p.requireVerified ? rank.verified : true) && (rank.score >= p.minScore);
    if (meets) return { allow: true, rank, reason: `ranked ${rank.score}/1000`, surcharge: 1 };
    // below threshold / unranked -> apply the fail policy
    if (p.onFail === "allow") return { allow: true, rank, reason: "below threshold, allowed by policy", surcharge: 1, cta: cta(callerKey, rank) };
    if (p.onFail === "surcharge") return { allow: true, rank, reason: `below threshold, surcharged ${p.surchargeX}x`, surcharge: p.surchargeX, cta: cta(callerKey, rank) };
    return { allow: false, rank, reason: rank.verified ? `rank ${rank.score} below required ${p.minScore}` : "unranked counterparty", surcharge: 1, cta: cta(callerKey, rank) };
  }
}

// Pull the caller identity (wallet|domain) out of an MCP tool call. Providers can override.
// Default: a `caller` or `_caller` field on the args ("0x..." or { wallet } or { domain }).
function defaultCallerFrom(args = {}) {
  const c = args.caller ?? args._caller;
  if (!c) return null;
  if (typeof c === "string") return c;
  return c.wallet || c.domain || null;
}

// Wrap an MCP tool handler so it only runs for ranked callers. On refusal, returns an MCP text result
// carrying the claim CTA (the acquisition hook), not a thrown error, so the calling agent sees how to fix it.
//   requireRank(handler, { minScore, requireVerified, onFail, callerFrom, onCheck })
export function requireRank(handler, opts = {}) {
  const { callerFrom = defaultCallerFrom, onCheck, ...policy } = opts;
  const gate = new RankGate(policy);
  return async (args, extra) => {
    const key = callerFrom(args, extra);
    const decision = await gate.check(key);
    if (onCheck) onCheck({ caller: key, decision });
    if (!decision.allow) {
      return { isError: true, content: [{ type: "text", text: `Access denied by requireRank: ${decision.reason}. ${decision.cta}` }], structuredContent: { requireRank: { allowed: false, ...decision } } };
    }
    const result = await handler(args, { ...extra, agentrank: decision });
    return result;
  };
}

// x402 rank-priced amount: ranked callers pay base, unranked/low pay a surcharge. Use in your 402 quote.
export function rankPrice(baseAmount, decision) {
  return Math.round(baseAmount * (decision?.surcharge || 1) * 1e6) / 1e6;
}

export default { requireRank, RankGate, resolveRank, rankPrice };
