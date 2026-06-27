// x402-safe — verify a counterparty before you pay it.
//
// 78% of everything paid on x402 is an unverifiable ghost (a wallet exactly one other wallet has ever
// paid). This wraps your x402 payment flow: when a server answers 402, it asks AgentRank whether the
// recipient is real and settlement-backed BEFORE your client settles. Real agents pass; ghosts and
// sybils are blocked or warned per your policy.
//
// Zero dependencies. Works with any x402 client: you supply the function that actually pays.
//
//   import { safeFetch, checkAgentTrust } from "x402-safe";
//   const res = await safeFetch(url, {}, { pay: (req) => x402Pay(req), policy: "block-ghosts" });

const API = "https://api.agentrank.info";

// Ask AgentRank: is this wallet/domain a real, settlement-backed agent?
export async function checkAgentTrust(key, { api = API, timeoutMs = 6000 } = {}) {
  try {
    const r = await fetch(`${api}/resolve/${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: "application/json" } });
    if (!r.ok) return { verified: false, score: 0, verdict: `agentrank unavailable (${r.status})`, unknown: true };
    const j = await r.json();
    return { verified: !!j.verified, score: j.score || 0, settlement: j.settlement || null, verdict: j.verdict, unknown: false };
  } catch (e) { return { verified: false, score: 0, verdict: `agentrank unreachable: ${e.message}`, unknown: true }; }
}

// Pull the recipient (payTo) + resource host out of an x402 402 response.
export async function parsePaymentRequirements(res) {
  let body = null; try { body = await res.clone().json(); } catch {}
  const accepts = (body && (body.accepts || body.paymentRequirements)) || [];
  const req = Array.isArray(accepts) ? accepts[0] : accepts;
  const payTo = req?.payTo || req?.pay_to || null;
  let host = null; try { host = req?.resource ? new URL(req.resource).hostname.replace(/^www\./, "") : null; } catch {}
  return { payTo, host, raw: req };
}

// Decide from a trust result under a policy. Returns { allow, reason }.
export function decide(trust, policy = "block-ghosts") {
  if (policy === "allow") return { allow: true, reason: "policy=allow" };
  if (trust.unknown) return { allow: policy !== "block-unknown", reason: "agentrank unknown" };
  if (trust.verified) return { allow: true, reason: `verified, score ${trust.score}` };
  // unverified (ghost / sybil / not-yet-claimed)
  if (policy === "warn") return { allow: true, reason: "unverified (warned)" };
  return { allow: false, reason: "unverified counterparty (ghost/sybil) blocked" };
}

// The main hook: fetch a URL; if it answers 402, verify the recipient before paying.
//   opts.pay(paymentRequirements) -> Promise<Response>   your x402 client's payment executor
//   opts.policy                   -> "block-ghosts" (default) | "block-unknown" | "warn" | "allow"
//   opts.onCheck(info)            -> optional callback with { payTo, host, trust, decision }
export async function safeFetch(input, init = {}, opts = {}) {
  const { pay, policy = "block-ghosts", api = API, onCheck } = opts;
  const res = await fetch(input, init);
  if (res.status !== 402) return res;
  if (typeof pay !== "function") throw new Error("x402-safe: provide opts.pay to settle the 402");

  const { payTo, host, raw } = await parsePaymentRequirements(res);
  const key = payTo || host;
  const trust = key ? await checkAgentTrust(key, { api }) : { verified: false, score: 0, verdict: "no recipient found", unknown: true };
  const decision = decide(trust, policy);
  if (onCheck) onCheck({ payTo, host, trust, decision });
  if (!decision.allow) {
    const err = new Error(`x402-safe blocked payment to ${key}: ${decision.reason}. ${trust.verdict}`);
    err.code = "X402_SAFE_BLOCKED"; err.trust = trust; err.payTo = payTo; err.host = host;
    throw err;
  }
  return pay(raw);
}

export default { safeFetch, checkAgentTrust, parsePaymentRequirements, decide };
