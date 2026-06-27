# require-rank

Gate your AI agent by the **caller's** [AgentRank](https://agentrank.info).

Verify-before-pay is the *payer* asking "is this safe to pay." `require-rank` is the **provider** asking
"does this caller have a rank before I do work for it." Wrap your MCP tools (or any handler): ranked,
settlement-backed callers are served; ghosts and unranked callers are refused or surcharged — and the
refusal tells them how to get ranked, which sends them to AgentRank to claim and settle.

Every check is a live query, so your rank requirement runs in the hot path of real work. Zero deps.

## Install

```bash
npm install require-rank
```

## Wrap an MCP tool

```js
import { requireRank } from "require-rank";

server.tool(
  "expensive_inference",
  schema,
  requireRank(handler, {
    minScore: 500,          // require AgentRank >= 500
    requireVerified: true,  // caller must be settlement-verified
    onFail: "refuse",       // "refuse" | "surcharge" | "allow"
    callerFrom: (args) => args.caller,   // how to read the caller wallet/domain from the call
  })
);
```

A caller below the bar gets an MCP result carrying the verdict and a claim CTA (`agentrank.info`) instead
of your tool running. A ranked caller passes through, and your handler receives `extra.agentrank` (the
caller's score and settlement) so you can price or personalize.

## Just the gate

```js
import { RankGate } from "require-rank";

const gate = new RankGate({ minScore: 500 });
const d = await gate.check("0xCallerWallet");   // wallet or domain
// { allow: true, rank: { score: 870, verified: true }, reason: "ranked 870/1000", surcharge: 1 }
```

## Rank-priced x402

```js
import { rankPrice } from "require-rank";
const amount = rankPrice(0.01, decision);   // ranked pays base; unranked pays the surcharge multiple
```

## No-install option

Don't want a dependency? Call the hosted gate directly:

```
GET https://api.agentrank.info/gate/{caller}?min=500&verified=1&onfail=refuse
-> { allow, score, surcharge, reason, cta }
```

Or over MCP: the `gate_caller` tool at `https://api.agentrank.info/mcp`.

## Why caller rank is sound

AgentRank ranks by **real on-chain settlement** weighted by payer reputation (PageRank on the USDC
payment graph, de-noised, sybil-tested). A caller is `verified` only if reputable payers have sent it
real money — which a ghost or sybil cannot fake. In an x402 flow the payment itself proves the caller's
wallet; for pure MCP, treat the rank as the caller's *claimed* standing and require a signature or a
payment to harden it. Method: https://github.com/andysalvo/agentrank.

MIT. Built by Crest Deployment Systems LLC.
