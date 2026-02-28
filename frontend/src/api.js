/*
  API helper – works in all environments:
  
  1. Development (npm start):  proxy in package.json → localhost:8000
  2. Production (npm build):   served by FastAPI on same origin
  3. Colab (ngrok):            set window.API_BASE before app loads
*/

const BASE = window.API_BASE || "";

export async function checkHealth() {
  const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Server unreachable");
  return res.json();
}

export async function sendQuery(query, maxTokens = 512) {
  const res = await fetch(`${BASE}/api/inference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  return res.json();   // { response: "...", time_sec: 1.23 }
}
