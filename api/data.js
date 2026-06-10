const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "musical-v4";

async function kvGet() {
  const res = await fetch(`${KV_REST_API_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const json = await res.json();
  if (!json.result) return {};
  let data = json.result;
  // 중첩 string 풀기
  while (typeof data === "string") {
    try { data = JSON.parse(data); } catch { return {}; }
  }
  // 최상위에 value 키가 있으면 한번 더 풀기
  while (data && typeof data === "object" && "value" in data && Object.keys(data).length === 1) {
    let inner = data.value;
    while (typeof inner === "string") {
      try { inner = JSON.parse(inner); } catch { return {}; }
    }
    data = inner;
  }
  return data || {};
}

async function kvSet(value) {
  // 절대 JSON.stringify 하지 않고 그냥 객체를 body에 직접 넣기
  await fetch(`${KV_REST_API_URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value }),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    // ?reset=1 이면 KV 초기화
    if (req.query && req.query.reset === "1") {
      await kvSet({});
      return res.status(200).json({ reset: true });
    }
    const data = await kvGet();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    await kvSet(req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
