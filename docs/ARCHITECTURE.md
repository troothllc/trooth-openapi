# Architecture

The Trooth Network is Trooth's only product: one public, signed, machine-readable
record per company. Two hosts serve it, and each has its own published contract.
This page names them and points at those contracts. It does not restate them, and
where it disagrees with one of them, the contract is right.

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'IBM Plex Mono, monospace','clusterBkg':'#f6f2e9','clusterBorder':'#0b0e14','titleColor':'#0b0e14','textColor':'#0b0e14','lineColor':'#0b0e14'}}}%%
flowchart TB
  WEB["trooth.co · thirteen public operations, no key · contract: trooth.co/openapi.json"]:::api
  API["api.trooth.co · a separate service · six public reads, two operations behind a DPoP-bound key, MCP server at /public/mcp · contract: trooth.co/openapi.yaml"]:::api
  API -- "MCP tool trooth_public_trust_profile reads GET /api/network/profile" --> WEB
  API --> HOOK["Signed webhooks to endpoints a company registers in its workspace"]:::dark

  classDef api fill:#d97706,stroke:#0b0e14,stroke-width:1.5px,color:#0b0e14;
  classDef dark fill:#161a24,stroke:#d97706,color:#f6f2e9;
```

## Trust boundary

Trooth signs what it witnessed. It never signs on a company's behalf. A witnessed
value says what a reading found, from a named source, on a stated date. It does not
say that a company's claim is true. What a company says about itself is declared or
attested by the company, and it is kept apart from what Trooth witnessed and from
public record.

No response carries a figure, a rank or a grade for a company. Neither `witnessed`
nor `updatedAt` is an audit opinion, and a caller restating either one elsewhere
must carry the limits in the `methodology` object with it. The public read carries
no signature today, so a caller cannot check Trooth's signature from it. Trooth's
public signing keys are listed at
[trooth.co/verify/keys](https://trooth.co/verify/keys).

## Data flow, end to end

1. A company publishes its record on the Network
   ([trooth.co/get-started](https://trooth.co/get-started)).
2. Trooth reads the company's public surface on an hourly cadence and records each
   reading. `GET /api/network/profile` on trooth.co returns the result in its
   `witnessed` block: the `standing` field (the API's name for the witnessed state,
   either `witnessed` or null), the first and the most recent reading,
   `checksPassed` out of `checksRun` (checks that read as expected, out of checks
   run) and the unbroken run of readings. Every response also carries a
   `methodology` object that states the cadence, the gap tolerance, the retention
   period, the freshness windows and what Trooth does not read.
3. Anyone can read a record with no credential: through the thirteen public
   operations on trooth.co (twelve GET and one POST batch read that changes
   nothing), or through the MCP server at `https://api.trooth.co/public/mcp`, whose `trooth_public_trust_profile` tool
   reads the trooth.co profile.
4. A company that registers a webhook endpoint in its workspace receives signed
   events from api.trooth.co. Every delivery carries the Standard Webhooks headers:
   `webhook-signature` is `v1,` and the base64 HMAC-SHA256 of `webhook-id`, a full
   stop, `webhook-timestamp`, a full stop and the raw body, keyed with the secret
   after `whsec_`, base64-decoded. A receiver refuses a timestamp more than 300
   seconds from its clock, compares in constant time and deduplicates on
   `webhook-id`. `x-trooth-signature-v2` signs the same timestamp and body in hex.
   The legacy `x-trooth-signature` signs the body alone, so it checks a replayed
   delivery forever; it is sent until 2027-04-30T23:59:59Z and not after. Each
   event is attempted up to three times. The files in `examples/` check the legacy
   header only; use the Standard Webhooks check for new receivers, as described at
   [trooth.co/docs/webhooks](https://trooth.co/docs/webhooks#verify). Where this
   paragraph and trooth.co/openapi.yaml differ, the contract is right.

## Where the contracts are kept

The contracts are produced where the routes live, not in this repository.
trooth.co/openapi.json says it is generated from the website's `app/api` tree, and
that a build gate fails when the document and the source disagree.
trooth.co/openapi.yaml describes the service at api.trooth.co, and its own change
record says each of its paths was traced to the handler that serves it on
2026-09-03. Where a file in this repository disagrees with either served contract,
the served contract is right.
