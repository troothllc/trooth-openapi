# Verify an X-Trooth-Signature webhook sent from api.trooth.co (Python). Constant-time compare on the RAW body.
# Alert destinations sign a timestamp and the body under a different scheme, and this check rejects them: https://trooth.co/docs#webhooks
import hashlib
import hmac


def verify_trooth(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


# FastAPI example: hash the exact bytes, then parse.
# @app.post("/webhooks/trooth")
# async def trooth_webhook(request: Request):
#     raw = await request.body()
#     if not verify_trooth(raw, request.headers.get("X-Trooth-Signature", ""), SECRET):
#         raise HTTPException(400, "bad signature")
#     event = json.loads(raw)
#     if event["type"] == "control.witnessed":
#         ...
#     return {"ok": True}
