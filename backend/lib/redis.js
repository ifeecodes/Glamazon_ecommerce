import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const rawUrl = process.env.UPSTASH_REDIS_REST_URL;

let client;

// If the URL looks like an HTTP(S) REST endpoint (Upstash REST), use a small
// REST wrapper instead of ioredis. Otherwise, create a regular ioredis client
// and attach an error handler to avoid unhandled error events crashing the app.
if (rawUrl && rawUrl.startsWith("http")) {
  const restUrl = rawUrl.replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  const restRequest = async (method, pathSuffix, body) => {
    const url = `${restUrl}/${pathSuffix}`;
    const headers = { Authorization: `Bearer ${token}` };
    if (body != null) headers["Content-Type"] = "text/plain";
    const res = await fetch(url, { method, headers, body: body ?? undefined });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upstash REST error ${res.status}: ${text}`);
    }
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  };

  client = {
    async set(key, value /*, ...args */) {
      await restRequest(
        "POST",
        `set/${encodeURIComponent(key)}`,
        String(value),
      );
      return "OK";
    },
    async get(key) {
      const json = await restRequest("GET", `get/${encodeURIComponent(key)}`);
      return json?.result ?? null;
    },
    async del(key) {
      const json = await restRequest("POST", `del/${encodeURIComponent(key)}`);
      return json?.result ?? 0;
    },
    on: () => {},
    quit: async () => {},
  };
} else {
  client = new Redis(rawUrl);
  client.on("error", (err) => {
    console.error("[ioredis] error:", err && err.message ? err.message : err);
  });
}

export const redis = client;
