// Verify an X-Trooth-Signature webhook (Node 18+). Constant-time compare on the RAW body.
import crypto from "node:crypto";

export function verifyTrooth(rawBody, signature, secret) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Express example — note express.raw so you hash the exact bytes Trooth signed.
// app.post("/webhooks/trooth", express.raw({ type: "application/json" }), (req, res) => {
//   if (!verifyTrooth(req.body, req.get("X-Trooth-Signature"), process.env.TROOTH_WEBHOOK_SECRET))
//     return res.status(400).send("bad signature");
//   const event = JSON.parse(req.body.toString("utf8"));
//   if (event.type === "trust.score.changed") { /* ... */ }
//   res.sendStatus(200);
// });
