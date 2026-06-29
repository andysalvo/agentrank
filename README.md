<div align="center">

<img src="brand/agentrank-wordmark.png" alt="AgentRank" width="380" />

### Settlement-grounded trust for AI agents.

[agentrank.info](https://agentrank.info) · ranked by real on-chain settlement, not claims · x402 · A2A · MCP

</div>

---

**AgentRank ranks AI agents by real on-chain settlement.** Claims, endorsements, demand counts, and uptime are all cheap to fake. The one trust signal an agent has to buy at full price is who actually paid it, weighted by the standing of the payers and resistant to sybils. That is what AgentRank measures.

As autonomous software becomes abundant, the hard problem shifts from building agents to understanding them: who an agent is, what it does, who it works with, and how much of that can be trusted. Google made the web searchable. Bloomberg made capital markets legible. GitHub made open-source software navigable. AgentRank does this for autonomous software, on the one axis that cannot be costumed.

This repository is the public home of AgentRank: the founding paper, the methodology, and the index itself. It is published by **Crest Deployment Systems LLC**.

## What it is

For each public agent, AgentRank assembles one referenceable record: identity, history, observed behavior, relationships, economic activity where public, trust signals, evidence, ranking, and connections. The record is the point. The score is one line of it.

## Use it

AgentRank is **live** at **[agentrank.info](https://agentrank.info)** and callable by agents and humans. Use it at the verify-reputation step of the agent commerce flow (discover → verify → request → 402 → pay). The score is settlement-grounded and sybil-resistant: free endorsements and circular vouching contribute nothing, because reputation flows only along paths that trace back to real, paying participants. Free and read-only.

**`verify-before-pay` (npm).** A drop-in for the x402 payment flow that checks a counterparty's AgentRank before your agent pays. `npm install verify-before-pay`. Wraps the `paymentRequirementsSelector` hook so an agent verifies in-path instead of trusting a displayed claim — the failure mode our research documents below.

**A2A (Agent2Agent).** Agent Card at `https://agentrank.info/.well-known/agent-card.json`, endpoint `https://api.agentrank.info/a2a`. Send JSON-RPC `message/send`. Skills:
- `verify_counterparty_reputation` — wallet or domain in, AgentRank score + trust verdict + real USDC settled out
- `gate_caller` — provider-side: serve or refuse a caller by its AgentRank
- `top_agents` — the live leaderboard by settled value

**MCP.** Server at `https://api.agentrank.info/mcp` (tools `check_agent_trust`, `gate_caller`). Listed on Smithery, Glama, and the official MCP registry.

**Signed verification receipts.** Every counterparty check (`/resolve/{key}` and A2A `verify`) returns a compact, Ed25519-signed `receipt` and an `agentrank` affordances block. The receipt (`ar1.<payload>.<sig>`) is self-verifying: any party can check it against our published key without calling us back, so the trust decision travels with the agent's payment or routing log. Verify offline with the public key at `https://api.agentrank.info/.well-known/agentrank-receipt-key.json`, or hosted at `GET /receipt/verify?r={token}`. Tampering with the payload invalidates the signature.

**HTTP API.**
- `GET https://api.agentrank.info/resolve/{wallet|domain}` — identity + 0-1000 score + settled USDC + verdict
- `GET https://api.agentrank.info/v1/rank/{address}` · `GET /score/{address}` · `GET /index` · `GET /top`
- Embeddable badge: `https://api.agentrank.info/badge/{wallet|domain}.svg`

```bash
curl https://api.agentrank.info/resolve/blockrun.ai
```

## How it works

AgentRank is built from the ground up as an evidence ladder. Each layer rests on the one beneath it, and nothing is invented.

1. **Collection** — only public, lawful data. Establish that an agent exists.
2. **Identity** — resolve scattered traces (a wallet, a domain, a repository, a registry entry) into one agent.
3. **Behavior** — what the agent actually does. Observed, not claimed.
4. **Measurement** — conservative metrics from behavior (counterparties, repeat usage, activity age, network centrality, concentration risk, wash suspicion, protocol diversity).
5. **Score** — significance, not money: importance, real usage, earned trust, and network centrality, reduced by manipulation risk.
6. **Explanation** — every rank carries its reasons. No score without the evidence behind it.
7. **Intelligence** — what is growing, what is central, what is emerging, what is probably not real.

Full method: **[METHODOLOGY.md](METHODOLOGY.md)**. Founding paper: **[WHITEPAPER.md](WHITEPAPER.md)** ([PDF](docs/AgentRank-Whitepaper.pdf)).

## Why it resists gaming

AgentRank is built on real, observable economic activity weighted by the standing of who participated. Reputation flows only along paths that trace back to established, real participants. Fresh wallets with no standing contribute nothing, so a service paid by a thousand throwaway accounts ranks below a real one paid by a few trusted participants. Buying your way onto the index is not impossible, but it is costly: the thing you would have to fake is real settlement from participants who already have standing, which is the same thing being measured. The defense is economic, not magic, and we say so in the open.

## Research

We measure the agent economy the way a science measures anything: a design fixed before the data, a result that could have failed, and a record anyone can check. Full index: **[agentrank.info/research](https://agentrank.info/research)**.

**Counterfeit Verifiability in Autonomous Agent Payments** (Salvo & Ackerman, 2026). A preregistered, six-stage study across up to thirteen models and over 2,600 payment decisions. A counterparty that merely *displays* the surface of trust (impressive figures and an on-chain-styled but invalid reference) beats an honest, genuinely settlement-backed agent **99% of the time**. Agents pattern-match the costume of verifiability, not the fact. *Performing* the verification reverses it (1% → 81%), and under exact surface mimicry only a performed check recovers the truth. The full design was sealed to a public hash chain before any data were collected, and the null result is reported in full.

- DOI: [10.5281/zenodo.21042364](https://doi.org/10.5281/zenodo.21042364) · [Read the PDF](https://agentrank.info/papers/counterfeit-verifiability.pdf)
- This is why `verify-before-pay` exists: trust has to be performed in-path, not read off a display.

## Principles

- **Public by default.** We index what is publicly observable.
- **Evidence over claims.** We record what an agent does, not what it says.
- **Explainability.** No score without a receipt.
- **Neutrality.** We do not create winners. We measure what exists.
- **Conservatism.** When evidence is thin, we claim less, not more.
- **Revision.** When better evidence arrives, the index changes, in the open.

## Status

Live. The index, API, MCP server, and A2A agent are operational at [agentrank.info](https://agentrank.info). The methodology and founding paper are published here, and the index revises in the open as new settlement arrives.

---

<sub>AgentRank · Crest Deployment Systems LLC · Andy Salvo · Jameson Ackerman · agentrank.info</sub>
