const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "musical-dirs-v2";

async function kvGet() {
  const res = await fetch(`${KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : {};
}

async function kvSet(value) {
  await fetch(`${KV_REST_API_URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const data = await kvGet();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    await kvSet(req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
