# Architecture

Three pillars, nine capabilities, one witness layer. Every capability writes to and
reads from the same signed evidence store; the public surface exposes only what a
company has chosen to publish.

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'IBM Plex Mono, monospace','clusterBkg':'#f6f2e9','clusterBorder':'#0b0e14','titleColor':'#0b0e14','textColor':'#0b0e14','lineColor':'#0b0e14'}}}%%
flowchart TB
  subgraph PROTECT["PROTECT · reduce risk"]
    A1[GRC Automation]:::c
    A2[AI Security Posture]:::c
    A3[AI Governance]:::c
  end
  subgraph PROVE["PROVE · show proof"]
    B1[Trust Center]:::c
    B2[Questionnaire Auto-Answer]:::c
    B3[Evidence Dossier]:::c
  end
  subgraph GROW["GROW · win deals"]
    C1[Trooth Network]:::c
    C2[Professional Directory]:::c
    C3[Marketplace Leads]:::c
  end

  PROTECT --> W
  PROVE --> W
  GROW --> W
  W["Witness layer · HMAC-signed evidence, append-only"]:::w
  W --> API{{"api.trooth.co · public reads · authed writes"}}:::api
  API --> PUB["Public Trust Profile / Network / Directory - no login"]:::dark
  API --> HOOK["Signed webhooks · trust.score.changed · control.witnessed · profile.viewed"]:::dark

  classDef c fill:#0b0e14,stroke:#d97706,stroke-width:1.5px,color:#f6f2e9;
  classDef w fill:#0b0e14,stroke:#f6f2e9,stroke-width:1.5px,color:#f6f2e9;
  classDef api fill:#d97706,stroke:#0b0e14,stroke-width:1.5px,color:#0b0e14;
  classDef dark fill:#161a24,stroke:#d97706,color:#f6f2e9;
  style PROTECT fill:#f6f2e9,stroke:#0b0e14,stroke-width:1px,color:#0b0e14
  style PROVE fill:#f6f2e9,stroke:#0b0e14,stroke-width:1px,color:#0b0e14
  style GROW fill:#f6f2e9,stroke:#0b0e14,stroke-width:1px,color:#0b0e14
```

## Trust boundary

The witness layer records what a scan observed and signs it. It does not assert that a
claim is true — it asserts that, at a point in time, evidence was witnessed. The
`advisory: true` flag rides on every payload. A buyer confirms independently using the
open-source verifier; Trooth is never in the position of certifying compliance or
signing a customer's claim.

## Data flow, end to end

1. A vendor runs a scan (`/v1/grc/scan`, the GitHub Action, or the CLI). PROTECT
   capabilities emit findings.
2. Findings are witnessed and signed into the append-only evidence store (witness layer).
3. PROVE capabilities render that evidence: the public Trust Profile, questionnaire
   drafts, and per-control dossiers — each carrying its signature.
4. GROW capabilities index published profiles: the Network, the Directory, and the
   buyer-intent leads that profile activity generates.
5. State changes emit signed webhooks so downstream systems stay current without polling.

## Why one platform, not nine repos

Stripe, Plaid, and Vanta ship a single canonical spec plus a small set of real SDKs —
not one repository per feature. A capability is a module behind the same contract, the
same auth, and the same witness guarantees. Splitting them into nine repos would
fragment the schema, duplicate auth, and dilute the one thing developers actually want:
a single source of truth they can import and trust.
