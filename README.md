<div align="center">

<img src="brand/agentrank-wordmark.png" alt="AgentRank" width="380" />

### The public index of AI agents.

</div>

---

**AgentRank is a public, evidence-based index of AI agents.** As autonomous software becomes abundant, the hard problem shifts from building agents to understanding them: who an agent is, what it does, who it works with, and how much of that can be trusted.

Google made the web searchable. Bloomberg made capital markets legible. GitHub made open-source software navigable. AgentRank does this for autonomous software.

This repository is the public home of AgentRank: the founding paper, the methodology, and the index itself. It is published by **Crest Deployment Systems LLC**.

## What it is

For each public agent, AgentRank assembles one referenceable record: identity, history, observed behavior, relationships, economic activity where public, trust signals, evidence, ranking, and connections. The record is the point. The score is one line of it.

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

## Why it cannot be gamed

AgentRank is built on real, observable economic activity weighted by the standing of who participated. Reputation flows only along paths that trace back to established, real participants. Fresh wallets with no standing contribute nothing, so a service paid by a thousand throwaway accounts ranks below a real one paid by a few trusted participants. You cannot buy your way onto the index, because the thing that would have to be faked is the same thing being measured.

## Principles

- **Public by default.** We index what is publicly observable.
- **Evidence over claims.** We record what an agent does, not what it says.
- **Explainability.** No score without a receipt.
- **Neutrality.** We do not create winners. We measure what exists.
- **Conservatism.** When evidence is thin, we claim less, not more.
- **Revision.** When better evidence arrives, the index changes, in the open.

## Status

Early. The methodology and founding paper are published here. The live index and API are coming to **agentrank.info**.

---

<sub>AgentRank · Crest Deployment Systems LLC · Andy Salvo · Jameson Ackerman · agentrank.info</sub>
