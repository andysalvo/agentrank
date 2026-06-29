# AgentRank Same-Hour Demand Initiative (plan)

Status: planning. To launch after the Sybil-Proof Threshold study lands.
Author of record: Andy Salvo. Drafted by the build agent.

## 1. Honest diagnosis (evidence, not theory)

What the demand canary actually shows after 2.4 days of real tracking:
- Real external demand is ~4.5 calls/day from 4 sources. Three of the four are
  other agent systems doing counterparty checks: AgentExchange (mass-verify),
  HermesRadar (rank + badge), metavision (returning A2A verifier). One is a human
  looking up the top agent.
- blockrun is the magnet: people check the top-ranked agent out of curiosity.
- Everything we shipped this week (receipts, batch mode, awesome-x402 PR, llms.txt,
  aicomglobal + ANP2 registration) is forward-loading. None is a same-hour lever.

The uncomfortable truth to hold: verification is a *derived* need. It only fires when
someone is (a) about to pay or rely on an agent and (b) worried about it. Two of our
own signals say that moment is still rare: agents paying agents on-chain at volume is
nascent, and the only organic callers are a handful of agent platforms. No distribution
trick manufactures a decision-moment that is not happening yet.

So the initiative must first answer one question, cheaply, before we build anything big:

> Is our problem DISTRIBUTION (the demand exists, it just has not found us) or MARKET
> (the agent-payment trust-decision is not happening at volume yet)?

We have the instrument to tell them apart: the `ref` capture added this week. If a
distribution push produces ref-attributed same-hour calls, it is distribution. If it
produces nothing across many real surfaces, it is the market, and the right move changes.

## 2. The trap we must not fall into

Per our own recurring failure mode (DNA-refraction trap): Crest over-converges on
neutral-trust infrastructure, mistakes internal reasoning and Team Zero for market
contact, and prefers elegance to urgency and distribution. The fix is binding here:
- Sharp vertical, not another general endpoint.
- Trust as a hidden feature inside something a real user already wants.
- External contact and measurement BEFORE building polished surfaces.

This plan is structured to obey that: an external test first, build only what the test
earns.

## 3. Candidate levers (ranked)

1. **Embed-in-platforms referral loop.** Get AgentRank verification plus a visible
   "verified by AgentRank" link into the agent registries, marketplaces, and scanners
   that already have traffic and already call us (AgentExchange, HermesRadar, MCP
   registries, x402 directories, Bazaar). Their users click through to us. Leverages
   the pull we already have. Team Zero endorsed this as the strongest wedge.
2. **Ghost Check: a free instant one-shot scanner that creates its own moment.** Paste a
   wallet or domain, get an instant verdict and a shareable card. Distributed as a
   trivially installable MCP tool and a social bot where agent-builders live. The hidden
   engine is AgentRank. Creates the decision-moment instead of waiting for it.
3. **Live-trigger engine.** Monitor the x402 and agent economy for ghosts and rugs (our
   own stat: most x402 counterparties are 1-payer ghosts). When one hits, publish the
   timely free check and a short post-mortem. Same-hour by definition; also feeds GEO.
4. **GEO cited-answer.** Be the LLM-named answer to "is agent X legit." Already in motion
   via llms.txt and FAQ schema. Compounding and durable, but slow, not same-hour.

## 4. Recommended sequence

### Phase 0 (this week): the external test, not a build
A one-week distribution sprint whose only purpose is to learn distribution-vs-market.
- List and embed AgentRank verification on 8 to 12 real, trafficked agent surfaces
  (registries, awesome-lists, directories, MCP catalogs, the two networks we joined).
- Where a surface lets us, add visible "verify with AgentRank" attribution with a link.
- Instrument everything with the `ref` field. Success = any ref-attributed same-hour
  external call. Read daily with `scripts/traffic.py`.
- Hard kill/learn gate at day 7: if >=3 ref-attributed real calls appear, it is
  distribution, proceed to Phase 1 on the lever that produced them. If ~0 across all
  surfaces, it is the market, freeze building and pivot to Phase 2.

### Phase 1 (if distribution): double down on the winning lever
Build out lever 1 (embed-in-platforms) or lever 2 (Ghost Check), whichever produced the
ref-attributed calls. Polish only the surface that earned it.

### Phase 2 (if market-not-here): do not force it
- Keep the position warm (research authority, GEO, presence) for when volume arrives.
- Serve the few real users deeply (AgentExchange, metavision): make us the verify layer
  they cannot live without, even at small N.
- Consider pointing the same settlement-grounded engine at a trust-decision that IS
  happening at volume today (token and wallet risk), where Crest already has product.
  This is a strategy question for the principals, not an agent build.

## 5. Metric and kill conditions
- Primary metric: ref-attributed same-hour external calls (real, non-poller).
- Phase 0 gate: >=3 by day 7 to continue building; ~0 means pivot, not persist.
- Anti-vanity: listings and impressions do not count. Only a real external call counts.
- We never fake settlements or self-call to inflate the canary.

## 6. Open questions for the principals
- Is AgentRank the right surface to drive same-hour demand, or is the demand presently
  in the adjacent token/wallet trust-decision where volume already exists?
- How much builder time do we spend forcing an early market vs positioning for it?
