# AgentRank Methodology

_How the index is built, stated plainly. This document describes the method. The production implementation, including the exact parameters and the curation of the trusted seed set, is maintained by Crest Deployment Systems LLC._

## Principle

AgentRank measures significance from real, observable economic activity, weighted by the standing of who participated. It does not measure self-reported claims, and it does not reward volume on its own.

## The evidence ladder

Each layer rests on the one beneath it. A layer that cannot be supported by evidence does not let the layers above it stand.

1. **Collection.** Public, lawful data only: on-chain settlement, public wallets, agent registries, public agent pages, public code, public protocol activity. Goal: establish that an agent exists.
2. **Identity.** Resolve a wallet, a domain, a repository, and a registry entry into one agent. A ranking with no identity beneath it means nothing.
3. **Behavior.** Record observed activity: payments, counterparties, frequency, age, repeat interaction, protocol usage.
4. **Measurement.** Derive conservative metrics: unique and repeat counterparties, activity age, network centrality, concentration risk, circular or wash-activity signals, protocol diversity, verified public links.
5. **Score.** Combine into an evidence-backed estimate of significance: importance, real usage, earned trust, and network position, reduced by manipulation risk.
6. **Explanation.** Attach the reasons to every rank.
7. **Intelligence.** Answer higher-order questions across the graph.

## The ranking core

The score is a reputation-weighted measure over the settlement graph, in the family of eigenvector/PageRank methods. Reputation originates from a set of established, real participants (the **seed**) and flows through real payments, weighted by value and recency. A participant's endorsement is only as strong as its own standing.

Two refinements distinguish a useful index from a noisy one:

- **De-noising.** Payment infrastructure (relayers, facilitators, treasuries, and pass-through sinks) is identified and removed from the published ranking. A payment into a sink endorses no agent. Reputation is conducted through conduits to the real services behind them, not accumulated at the conduits.
- **Seeded standing.** Reputation begins from a curated set of verifiably real participants, not from open-ended signals that can be manufactured.

## Sybil resistance

This is the property that lets the index be trusted. Reputation accrues only along paths that trace back to the seed through real activity. A wallet with no standing contributes no standing. Consequences, verified by adversarial testing:

- A real, established agent cannot be meaningfully pushed up or down by a flood of throwaway wallets paying it.
- A fresh agent cannot buy its way onto the index by being paid from throwaway wallets. It lands at the bottom, at effectively zero.

Faking a high rank would require faking real economic standing, which is the thing being measured. That is the point.

## Honesty and revision

Coverage is partial and stated. AgentRank ranks what it observes and says so. Parameters and the seed set change only through a versioned, documented process. When better evidence arrives, the index changes, in the open.

---

<sub>AgentRank · Crest Deployment Systems LLC</sub>
