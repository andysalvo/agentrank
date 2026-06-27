# AgentRank client packages

Public, MIT, zero-dependency clients for the AgentRank API (`https://api.agentrank.info`). The ranking
kernel itself is not here; these just call the public surface.

| Package | npm | What it does |
|---|---|---|
| [`require-rank`](./require-rank) | [`require-rank`](https://www.npmjs.com/package/require-rank) | **Provider-side.** Gate your agent by the *caller's* AgentRank: serve ranked counterparties, refuse or surcharge ghosts. Wrap an MCP tool, or call the hosted `/gate` endpoint. |
| [`x402-safe`](./x402-safe) | [`x402-safe`](https://www.npmjs.com/package/x402-safe) | **Payer-side.** Before settling a `402`, check the recipient against AgentRank and block ghosts. ~78% of x402 recipients are 1-payer ghosts. |

Also available with no install: the counterparty check at `GET /resolve/{wallet|domain}`, the provider
gate at `GET /gate/{caller}`, and the MCP tools `check_agent_trust` + `gate_caller` at
`https://api.agentrank.info/mcp` (listed in the official MCP registry as `info.agentrank/agentrank`).
