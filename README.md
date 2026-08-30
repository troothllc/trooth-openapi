# Trooth developer platform

The developer surface for the Trooth Network, the witnessed trust network for software and AI companies. Read any company's public trust record with no key and no account, and wire Trooth into your own stack. Public reads are open; write and monitoring paths take a Bearer key from your plan.

The boundary is the product. Trooth automates and witnesses. Trooth never signs your claims for you, and never certifies anyone. Every value the API returns is witnessed evidence, what a scan observed, cryptographically anchored, carried with an `advisory: true` flag. You sign your own claim; buyers verify it themselves.

```bash
# No key, no account: read any company's public record
curl https://api.trooth.co/public/trust/acme-ai
```

## The capabilities

| Group | Capability | Primary endpoint |
| --- | --- | --- |
| Assess | GRC automation | `POST /v1/grc/scan` · `GET /v1/grc/controls` |
| Assess | AI security posture | `POST /v1/ai-security/scan` |
| Assess | AI governance | `GET /v1/ai-governance/inventory` |
| Publish | Trust record | `GET /public/trust/{slug}` |
| Publish | Questionnaire auto-answer | `POST /v1/questionnaire/answer` |
| Publish | Evidence dossier | `GET /v1/evidence/{control}` |
| Network | Trooth Network search | `GET /public/network/search` |
| Network | Public directory | `GET /public/directory` |
| Network | Marketplace leads | `GET /v1/marketplace/leads` |

Full contract: [`spec/openapi.yaml`](spec/openapi.yaml) (OpenAPI 3.1, CI-linted). Import it into Postman, Stoplight, or a client generator and every schema, example, and error is there.

## Quickstart: read a trust record

The public trust record API is unauthenticated. `acme-ai` is a live sample; unknown slugs return a real `404 not_found` and freshly claimed ones return `202 not_yet_witnessed`.

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

Write and monitoring paths take a Bearer key. Free keys self-serve at signup, no card. Rate limits scale by plan; over-limit returns `429` with `Retry-After`.

```bash
curl -X POST https://api.trooth.co/v1/grc/scan -H "Authorization: Bearer $TROOTH_API_KEY" -H "Content-Type: application/json" -d '{"framework":"soc2","plan":{},"fail_on":"none"}'
```

Report-only by design: `/v1/grc/scan` and the GitHub Action's `/v1/preflight` never apply changes and never gate a merge unless you set `fail_on`.

## Webhooks

Subscribe to state changes; Trooth POSTs a signed JSON event to your endpoint.

| Event | Fires when |
| --- | --- |
| `trust.score.changed` | Your standing moved. |
| `control.witnessed` | A control was witnessed or re-witnessed by a scan. |
| `profile.viewed` | A buyer opened your public trust record. |
| `profile.requested` | A buyer asked you to publish a record. |

Every delivery is signed. `X-Trooth-Signature` is an HMAC-SHA256 of the raw body, keyed with your endpoint secret. Verify in constant time before trusting a payload; reference implementations are in [`examples/`](examples/).

## Errors

Four explicit states, consistent across every endpoint:

| Status | `error` | Meaning |
| --- | --- | --- |
| 404 | `not_found` | No resource for that identifier. |
| 429 | `rate_limited` | Plan limit exceeded; back off per `Retry-After`. |
| 5xx | `server_error` | Our fault; safe to retry with backoff. |
| 202 | `not_yet_witnessed` | Claimed but no witnessed evidence yet. |

## Repository layout

```
spec/openapi.yaml        Canonical OpenAPI 3.1 contract
examples/                Copy-paste clients: cURL, Node, Python, Go, plus HMAC verify
docs/ARCHITECTURE.md     How witnessing works, end to end
.github/workflows/       CI: the spec is linted on every push
```

## Get on the Network

The API is one half. The other half is a public trust record buyers and their AI agents actually read. Claim your page and get witnessed at [trooth.co/signup](https://trooth.co/signup), or browse the Network at [trooth.co/network](https://trooth.co/network).

## License

Apache-2.0. Trooth automates. Trooth never signs.
