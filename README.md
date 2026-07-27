# Trooth OS — Developer Platform

Compliance infrastructure for AI. One API, three pillars, nine capabilities. Public
posture reads need no account; authenticated calls use a Bearer key from your plan.

The boundary is the product. Trooth automates and witnesses. Trooth never signs your
claims for you, and never certifies compliance. Every value the API returns is
*witnessed* evidence — what a scan observed, cryptographically anchored — carried with
an `advisory: true` flag. You sign your own claim; buyers verify it themselves.

```bash
# No key, no account — read any company's public posture
curl https://api.trooth.co/public/trust/acme-ai
```

## The nine capabilities

| Pillar | Capability | Primary endpoint |
| --- | --- | --- |
| PROTECT | GRC Automation | `POST /v1/grc/scan` · `GET /v1/grc/controls` |
| PROTECT | AI Security Posture | `POST /v1/ai-security/scan` |
| PROTECT | AI Governance | `GET /v1/ai-governance/inventory` |
| PROVE | Trust Center | `GET /public/trust/{slug}` |
| PROVE | Questionnaire Auto-Answer | `POST /v1/questionnaire/answer` |
| PROVE | Evidence Dossier | `GET /v1/evidence/{control}` |
| GROW | Trooth Network | `GET /public/network/search` |
| GROW | Professional Directory | `GET /public/directory` |
| GROW | Marketplace Leads | `GET /v1/marketplace/leads` |

Full contract: [`spec/openapi.yaml`](spec/openapi.yaml) (OpenAPI 3.1, CI-linted). Import
it into Postman, Stoplight, or a client generator and every schema, example, and error
is there.

## Quickstart — read a Trust Profile

The public Trust Profile API is unauthenticated. `acme-ai` is a live sample; unknown
slugs return a real `404 not_found` and freshly-claimed ones return `202 not_yet_witnessed`.

```bash
# cURL
curl https://api.trooth.co/public/trust/acme-ai
```
```js
// Node.js (fetch, Node 18+)
const r = await fetch("https://api.trooth.co/public/trust/acme-ai");
if (r.status === 404) throw new Error("no such profile");
const profile = await r.json();
console.log(profile.trust_score, profile.state); // 82 "witnessed"
```
```python
# Python
import httpx
r = httpx.get("https://api.trooth.co/public/trust/acme-ai")
r.raise_for_status()
print(r.json()["trust_score"])
```
```go
// Go
resp, err := http.Get("https://api.trooth.co/public/trust/acme-ai")
if err != nil { log.Fatal(err) }
defer resp.Body.Close()
var p map[string]any
json.NewDecoder(resp.Body).Decode(&p)
fmt.Println(p["trust_score"], p["state"])
```

## Authenticated calls

Write and monitoring paths take a Bearer key. Free Bronze keys self-serve at signup, no
card. Rate limits scale by plan; over-limit returns `429` with `Retry-After`.

```bash
curl https://api.trooth.co/v1/grc/scan \
  -H "Authorization: Bearer $TROOTH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"framework":"soc2","plan":{},"fail_on":"none"}'
```

Report-only by design: `/v1/grc/scan` and the GitHub Action's `/v1/preflight` never
apply changes and never gate a merge unless *you* set `fail_on`. Until 2026-08-02 they
run in scaffold mode and return `state: pending` rather than a false pass.

## Webhooks

Subscribe to state changes; Trooth POSTs a signed JSON event to your endpoint.

| Event | Fires when |
| --- | --- |
| `trust.score.changed` | Your Trust Score moved. |
| `control.witnessed` | A control was (re)witnessed by a scan. |
| `profile.viewed` | A buyer opened your public Trust Profile. |
| `profile.requested` | A buyer asked you to publish a profile. |

Every delivery is signed. `X-Trooth-Signature` is an HMAC-SHA256 of the raw body, keyed
with your endpoint secret. Verify in constant time before trusting a payload — reference
implementations in [`examples/`](examples/).

## Errors

Four explicit states, consistent across every endpoint:

| Status | `error` | Meaning |
| --- | --- | --- |
| 404 | `not_found` | No resource for that identifier. |
| 429 | `rate_limited` | Plan limit exceeded; back off per `Retry-After`. |
| 5xx | `server_error` | Our fault; safe to retry with backoff. |
| 202 | `not_yet_witnessed` | Claimed but no witnessed evidence yet (pending). |

## Repository layout

```
spec/openapi.yaml        Canonical OpenAPI 3.1 contract (all nine capabilities)
examples/                Copy-paste clients — cURL, Node, Python, Go + HMAC verify
docs/ARCHITECTURE.md     Pillars → capabilities → witness layer
docs/MONETIZATION.md     Tiered API, usage hooks, growth loops
.github/workflows/       CI: the spec is linted on every push
```

## License

Apache-2.0. Trooth automates. Trooth never signs.
