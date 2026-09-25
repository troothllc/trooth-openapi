# trooth-platform

The OpenAPI 3.1 description of the public Trooth API.

Trooth operates the Trooth Network: one public, signed, machine-readable record per company, carrying its identity, products and demos, commercial terms, domain and marketing links, people, documents, security and privacy posture, AI practices, procurement terms and relationships. It is Trooth's only product and it is free.

DNS says where a company is. A TLS certificate says the connection is authentic. The Trooth Network says who the company is and what it does with your data.

**Trooth witnesses and dates facts. It does not score, rate, rank or certify anyone.**

## Where the statements in this file come from

Every statement below about the API was read out of the published OpenAPI document served at [trooth.co/openapi.json](https://trooth.co/openapi.json) on 2026-09-19, and checked again on 2026-09-25 against the website's source copy of that document. Where this file says "the document", it means the published contract, not a file at a path here.

**The files in this repository are not that contract.** `spec/openapi.yaml` here is a copy of the contract for the other host, `api.trooth.co`, as served at [trooth.co/openapi.yaml](https://trooth.co/openapi.yaml). `examples/` holds signature checks for webhooks sent from `api.trooth.co`, not examples of the operations below. Where a file here disagrees with a served contract, the served contract is right.

If a reader needs the contract itself rather than a description of it, fetch it:

```bash
curl -s https://trooth.co/openapi.json
```

That URL is the copy Trooth serves, so it is the version to check anything below against.

## What the document describes

OpenAPI `3.1.0`. `info.title` is "Trooth Public API", `info.version` is `1.1.0`. One server, `https://trooth.co`, described as Production. Nine paths, nine operations, all of them `GET`.

**There is no authentication.** The document declares no `securitySchemes` and no document-level `security`, and every one of the nine operations carries `security: []`. Public reads need no key, no account and no header.

The contact block names developers@trooth.co and [trooth.co/developers](https://trooth.co/developers). The license block points at the [Terms of Service](https://trooth.co/terms), which is the terms the API is used under, not a software license for this repository.

| Operation | Path | What the document says it returns |
|---|---|---|
| `get_api_network_profile` | `/api/network/profile?q=` | The canonical published profile for one company, keyed by domain or slug, with the witness facts: the `standing` field (the API's name for the witnessed state, which is either `witnessed` or null), `lastWitnessed`, `firstWitnessedAt`, the unbroken run of Trooth's own hourly readings, and `checksPassed` out of `checksRun` (checks that read as expected, out of checks run). Answers `{ found: false }` with 200 when nothing is published, 400 when `q` is missing. Edge-cached 120 seconds. |
| `get_api_public_mesh_handle_` | `/api/public-mesh/{handle}` | A company's public evidence rollup: witnessed state per pillar, framework rollups, provider status. Individual control rows, owners and internal notes are never returned. Readable cross-origin; this is the read the embeddable badge performs. Edge-cached 300 seconds. |
| `get_api_mobile_directory_search` | `/api/mobile/directory/search` | Full-text search over published listings, the same companies the public directory shows. Cursor pagination via `next_cursor`; offset still works and is kept for shipped clients, but it is deprecated, and a response to an offset-paged request carries a `Deprecation` header. Edge-cached 60 seconds with a 300 second stale-while-revalidate window. |
| `get_api_mobile_directory_featured` | `/api/mobile/directory/featured` | Published companies, those with a witnessed record first. Edge-cached 120 seconds. |
| `get_api_mobile_directory_vendor_slug_` | `/api/mobile/directory/vendor/{slug}` | One published company profile and its live witnessed state where Trooth has witnessed the company. A slug of the form `d--example.com` resolves a witnessed company that has not published a rich profile yet. Edge-cached 120 seconds. |
| `get_api_network_suggest` | `/api/network/suggest?q=` | Name-to-company typeahead over the same published listings. Edge-cached 60 seconds. |
| `get_api_compare` | `/api/compare?handles=` | A comparison of published witnessed facts across up to a handful of companies. Control rows are stripped. Rate limited, and the only operation in the document that documents a 429. |
| `get_api_legal_slug_` | `/api/legal/{slug}` | The full text of one published Trooth legal document, with title, effective date and body. Edge-cached one hour with a one day stale-while-revalidate window. |
| `get_api_version` | `/api/version` | The build stamp of the deployment currently serving. Never cached. |

## The one schema

The document defines a single component schema, `NetworkProfileV2`, the body of `GET /api/network/profile`. It is a JSON Schema in its own right, with `$id` `https://trooth.co/schemas/network-profile.v2.schema.json`, and it is a `oneOf` over two shapes: a not-found object whose only required field is `found: false`, and a found object.

The found object requires sixteen fields, among them `contractVersion`, `contractNote`, `contractOmissions`, `deprecation`, `canonicalUrl`, `updatedAt`, `witnessed`, `methodology`, `facts` and `conflicts`. Three of those are worth an integrator's attention:

- `contractOmissions` is an explicit list of what the contract does *not* carry, sent in the response rather than left in documentation.
- `methodology` states the reading cadence, the gap tolerance that defines an unbroken series, the retention period, the per-category freshness windows, and the coverage limits (what Trooth does not read). The document says a caller restating `witnessed` or `updatedAt` elsewhere must carry those limits with it, because neither field is a certification and neither is an audit opinion.
- `contractVersion` is pinnable. `GET /api/network/profile` takes an optional `contract` query parameter; a version the deployment does not answer is refused with 400 rather than approximated. Additions do not move the version; a removal, a rename or a change of meaning does, and a new schema is published beside the old one.

The schema's own description states what it refuses to allow: any field named `score`, `rating`, `rank`, `grade` or `confidence`, "because the contract carries none and a reader must not be able to find one."

## How to read a response

The document names the vocabulary its responses use to say where a fact came from and how current it is: *witnessed*, *public record* (sent on the wire as `verified`), *declared*, *inferred*, *unknown*, *not applicable*, *restricted*, *unavailable*, *stale* and *conflicting*. Two of those carry more weight than they look:

- **Unknown is an answer**, not a blank waiting to be filled in.
- **Stale is never the same as wrong.** It means the last reading is older than the freshness window for that category, and the reading itself still stands.

No response carries a figure, a rank or a grade for a company. The document states the four witness facts that exist instead: coverage (checks that read as expected, out of checks run), freshness (last read), continuity (unbroken since) and change.

A 404 from these endpoints usually means the Network holds no record, which is an answer rather than a failure. The same is true of a privacy-preserving 404 from `/api/public-mesh/{handle}`.

## What the document deliberately leaves out

Stated in the document's own description, and worth repeating here so nobody reads an absence as an oversight:

- Authentication flows are absent. They are browser redirects in a login sequence, not an API.
- Unauthenticated endpoints that send mail or start work are rate limited and undocumented on purpose.
- Every session-authenticated endpoint is absent, because publishing an internal route map helps an attacker and promises an API that is not offered.

This document also covers the `trooth.co` host only. It declares one server and nine paths under it. Its description names the other host, `api.trooth.co`, as a separate service with its own contract at [trooth.co/openapi.yaml](https://trooth.co/openapi.yaml), and it declares no path on that host.

## How it is kept true

The document says it is generated from the `app/api` tree of the Trooth web application by `scripts/gen-openapi.mjs`, and that a build gate fails when the document and the source disagree. That gate exists in the web repository and runs there, which is why the contract cannot quietly outlive the routes it names.

Two consequences for anyone building on it. A path in this document is a path a route file serves, rather than one somebody meant to add. And a path that is missing is missing on purpose, per the exclusions above, rather than forgotten.

## Known gap in this description

The document carries no `example` or `examples` anywhere: not on an operation, not on a response, not in the schema. Anywhere Trooth's own writing offers "the OpenAPI description with worked examples", the examples are not in the document that trooth.co serves. This repository does not supply them either: `examples/` holds only webhook signature checks.

## Security

Report a vulnerability through the [Vulnerability Disclosure Policy](https://trooth.co/security/vulnerability-disclosure-policy).

Nothing described here takes a credential, so there is no key to leak through it. Every operation reads data already public to any browser.

## Links

- The contract: [trooth.co/openapi.json](https://trooth.co/openapi.json)
- The API reference, written for people: [trooth.co/docs/api](https://trooth.co/docs/api)
- Developers: [trooth.co/developers](https://trooth.co/developers)
- Agents and MCP: [trooth.co/docs/agents](https://trooth.co/docs/agents)
- The Network: [trooth.co/network](https://trooth.co/network)
- How witnessing works, and what Trooth does not read: [trooth.co/methodology](https://trooth.co/methodology)
- Verify a signature yourself: [trooth.co/verify/keys](https://trooth.co/verify/keys)
- Publish your own record, free: [trooth.co/get-started](https://trooth.co/get-started)
- Contact: [trooth.co/contact](https://trooth.co/contact)

## License

Apache License 2.0.

Trooth signs what it witnessed. It never signs on a company's behalf.
