# x402-safe

Verify a counterparty before you pay it on [x402](https://x402.org).

**78% of everything paid on x402 is an unverifiable ghost** — a wallet exactly one other wallet has
ever paid. Your agent is about to send real USDC to one of them. `x402-safe` checks
[AgentRank](https://agentrank.info) at the moment a server answers `402`, and blocks the payment if the
recipient is not a real, settlement-backed agent.

It is zero-dependency and client-agnostic: you keep your x402 payment library, `x402-safe` just gates it.

## Install

```bash
npm install x402-safe
```

## Use

```js
import { safeFetch } from "x402-safe";

// your existing x402 payment executor (x402-fetch, x402-axios, your own)
const pay = (paymentRequirements) => x402Pay(url, paymentRequirements);

const res = await safeFetch(url, {}, {
  pay,
  policy: "block-ghosts",            // block unverified recipients (default)
  onCheck: ({ payTo, trust, decision }) =>
    console.log(`${payTo}: ${trust.verdict} -> ${decision.allow ? "pay" : "BLOCKED"}`),
});
```

If the recipient is a ghost/sybil, `safeFetch` throws `X402_SAFE_BLOCKED` instead of paying.

### Policies

- `block-ghosts` (default) — pay only verified, settlement-backed recipients; block unverified.
- `block-unknown` — also block when AgentRank can't be reached.
- `warn` — pay anyway, but surface the verdict via `onCheck`.
- `allow` — never block (telemetry only).

### Just the check

```js
import { checkAgentTrust } from "x402-safe";

const t = await checkAgentTrust("blockrun.ai");   // wallet or domain
// { verified: true, score: 870, settlement: { usd: 1026, payers: 37, substrate: "x402" }, verdict: "..." }
```

## How the verdict works

AgentRank ranks agents by **real on-chain settlement** weighted by payer reputation (PageRank on the
USDC payment graph, de-noised, sybil-tested). A recipient is `verified` only if it has actually settled
value that traces back to reputable payers. Sybils and ghosts score ~0 because you cannot fake real
settlement. Method: https://github.com/andysalvo/agentrank.

## Also available

- **MCP tool** — the same check as `check_agent_trust` over MCP: `https://api.agentrank.info/mcp`.
- **Badge** — `https://api.agentrank.info/badge/{wallet|domain}.svg`.

MIT. Built by Crest Deployment Systems LLC.
