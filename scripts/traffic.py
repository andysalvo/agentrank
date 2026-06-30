#!/usr/bin/env python3
"""
AgentRank demand tracker.

One command to see the honest picture of who is actually using AgentRank.
Reads the live demand log (calls.jsonl) and separates real external usage from
our own self-calls, search crawlers, and automated uptime pollers, so the
demand number stays truthful.

Usage:
    python3 scripts/traffic.py                 # pull live log from the droplet and report
    python3 scripts/traffic.py path/to.jsonl   # report on a local log file
    python3 scripts/traffic.py --window 24     # only count the last N hours as "demand"

Honesty rules baked in (a provenance company should not flatter its own metrics):
  - internal  = our own SSR/probes (src=web, our IPs, our user-agents)   -> NOT demand
  - crawler   = search / AI indexers (Googlebot, GPTBot, ...)            -> indexing, not demand
  - poller    = automated uptime checks: regular cadence, or only ever
                hits the literal key "test" / empty key                  -> monitoring, not demand
  - real      = everything else                                          -> actual demand
"""
import json, sys, subprocess, collections, datetime, statistics, tempfile, os, re

DROPLET = "root@167.71.254.98"
REMOTE_LOG = "/home/andy/agentrank/calls.jsonl"

CRAWLER = ("gptbot", "oai-searchbot", "chatgpt-user", "googlebot", "google-extended",
           "bingbot", "perplexitybot", "perplexity-user", "claudebot", "claude-web",
           "anthropic-ai", "yandexbot", "applebot", "bytespider", "ccbot",
           "meta-externalagent", "facebookexternalhit", "duckduckbot", "amazonbot",
           "semrushbot", "ahrefsbot", "dotbot", "mj12bot")


def load(path):
    rows = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except Exception:
                    pass
    return rows


def parse_at(r):
    try:
        return datetime.datetime.fromisoformat(r["at"].replace("Z", "+00:00"))
    except Exception:
        return None


def is_crawler(r):
    ua = (r.get("ua") or "").lower()
    return r.get("crawler") or any(c in ua for c in CRAWLER)


def _plausible_target(k):
    """A real demand lookup is a wallet (0x..40hex), a domain (has a dot), or 'top'/'census'.
    Junk like '[object Object]', 'undefined', 'function', 'warn', 'test' is a bot/scraper artifact."""
    k = str(k or "")
    if k in ("top", "census"):
        return True
    if re.fullmatch(r"0x[0-9a-fA-F]{40}", k):
        return True
    if "." in k and " " not in k and "object" not in k.lower():
        return True
    return False


def classify_source(rows):
    """Return 'poller' or 'real' for one IP's worth of external (non-internal/crawler) rows."""
    TESTY = {"test", "None", "", "null", "census"}  # monitor probe keys
    keys = {str(r.get("key")) for r in rows}
    if keys <= TESTY:
        return "poller"
    # A source whose keys are MOSTLY test/probe values is the uptime monitor exercising our tools.
    testy = sum(1 for r in rows if str(r.get("key")) in TESTY)
    if len(rows) >= 4 and testy / len(rows) >= 0.6:
        return "poller"
    # Scraper/bot: a burst of many calls whose targets are mostly junk (not wallets/domains).
    plausible = sum(1 for r in rows if _plausible_target(r.get("key")))
    if len(rows) >= 8 and plausible / len(rows) < 0.4:
        return "poller"
    # Burst from one IP (many calls in a tiny window) with no plausible targets = scraper.
    times = sorted(t for t in (parse_at(r) for r in rows) if t)
    if len(rows) >= 20 and times and (times[-1] - times[0]).total_seconds() < 180 and plausible / len(rows) < 0.6:
        return "poller"
    if len(times) >= 4:
        gaps = [(times[i + 1] - times[i]).total_seconds() / 3600 for i in range(len(times) - 1)]
        mean = statistics.mean(gaps) or 1
        if mean > 0.5 and statistics.pstdev(gaps) / mean < 0.35:  # metronome cadence
            return "poller"
    return "real"


def fmt(dt):
    return dt.isoformat()[:16] if dt else "?"


def main():
    args = [a for a in sys.argv[1:]]
    window = None
    if "--window" in args:
        i = args.index("--window")
        window = float(args[i + 1]); del args[i:i + 2]
    path = args[0] if args else None

    if not path:
        tmp = os.path.join(tempfile.gettempdir(), "agentrank-calls.jsonl")
        print(f"pulling {DROPLET}:{REMOTE_LOG} ...", file=sys.stderr)
        subprocess.run(["scp", "-o", "ConnectTimeout=12", f"{DROPLET}:{REMOTE_LOG}", tmp], check=True)
        path = tmp

    rows = load(path)
    ts = [t for t in (parse_at(r) for r in rows) if t]
    if not ts:
        print("no rows"); return
    span_start, span_end = min(ts), max(ts)

    internal = [r for r in rows if r.get("internal")]
    crawlers = [r for r in rows if not r.get("internal") and is_crawler(r)]
    external = [r for r in rows if not r.get("internal") and not is_crawler(r)]

    byip = collections.defaultdict(list)
    for r in external:
        byip[r.get("ip")].append(r)
    tags = {ip: classify_source(rs) for ip, rs in byip.items()}
    real = [r for ip, rs in byip.items() if tags[ip] == "real" for r in rs]
    pollers = [r for ip, rs in byip.items() if tags[ip] == "poller" for r in rs]

    print("=" * 64)
    print("AGENTRANK DEMAND TRACKER")
    print("=" * 64)
    days = (span_end - span_start).total_seconds() / 86400
    print(f"log span: {fmt(span_start)} -> {fmt(span_end)} UTC  ({days:.1f}d)")
    print(f"total calls logged: {len(rows)}")
    print(f"  internal (our SSR/probes): {len(internal)}")
    print(f"  crawlers (search/AI index): {len(crawlers)}", end="")
    if crawlers:
        seen = sorted({next((c for c in CRAWLER if c in (r.get('ua') or '').lower()), '?') for r in crawlers})
        print("  " + ", ".join(seen), end="")
    print()
    print(f"  external pollers (uptime):  {len(pollers)}  ({sum(tags[ip]=='poller' for ip in tags)} sources)")
    print(f"  REAL external demand:       {len(real)}  ({sum(tags[ip]=='real' for ip in tags)} sources)")
    if real:
        rate = len(real) / max(days, 0.01)
        print(f"  real demand rate: {rate:.1f} calls/day")

    if window:
        cut = span_end - datetime.timedelta(hours=window)
        rw = [r for r in real if (parse_at(r) or span_start) >= cut]
        print(f"  REAL in last {window:g}h: {len(rw)}")

    print("\n--- REAL external actors ---")
    real_ips = sorted([ip for ip in byip if tags[ip] == "real"],
                      key=lambda ip: -len(byip[ip]))
    for ip in real_ips:
        rs = byip[ip]
        uas = collections.Counter((r.get("ua") or "")[:24] for r in rs)
        kinds = collections.Counter(r.get("kind") for r in rs)
        keys = collections.Counter(str(r.get("key")) for r in rs)
        t0 = min(parse_at(r) for r in rs if parse_at(r))
        t1 = max(parse_at(r) for r in rs if parse_at(r))
        repeat = " RETURNING" if (t1 - t0).total_seconds() > 3600 else ""
        print(f"\n  {ip}  ({len(rs)} calls{repeat})  {fmt(t0)} -> {fmt(t1)}")
        print(f"    ua:        {', '.join(f'{u}×{n}' for u,n in uas.most_common())}")
        print(f"    endpoints: {dict(kinds)}")
        print(f"    looked up: {', '.join(f'{k}×{n}' for k,n in keys.most_common(6))}")

    # What agents the world cares about (the magnets), real demand only
    mag = collections.Counter(str(r.get("key")) for r in real
                              if str(r.get("key")) not in ("test", "None", "", "null"))
    if mag:
        print("\n--- most-looked-up agents (real demand) ---")
        for k, n in mag.most_common(10):
            print(f"  {n:>3}  {k}")

    # Anomalies worth a human glance
    anom = [r for r in rows if "${" in str(r.get("key")) or "encodeURIComponent" in str(r.get("key"))]
    if anom:
        print("\n--- anomalies (likely a broken embed/template) ---")
        for r in anom[:5]:
            print(f"  {fmt(parse_at(r))}  kind={r.get('kind')}  key={r.get('key')!r}  ip={r.get('ip')}")


if __name__ == "__main__":
    main()
