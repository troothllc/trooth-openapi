// Verify an X-Trooth-Signature webhook (Go). Constant-time compare on the RAW body.
package trooth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
)

func VerifyTrooth(rawBody []byte, signature, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

// http.HandlerFunc example:
//   body, _ := io.ReadAll(r.Body)
//   if !VerifyTrooth(body, r.Header.Get("X-Trooth-Signature"), secret) {
//       http.Error(w, "bad signature", http.StatusBadRequest); return
//   }
//   var event map[string]any
//   json.Unmarshal(body, &event)
