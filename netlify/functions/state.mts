import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const EMPTY_STATE = { checks: {}, customEntries: [], settings: {} };

export default async (req: Request, context: Context) => {
  const store = getStore("chore-tracker");

  if (req.method === "GET") {
    const data = await store.get("state", { type: "json" });
    return new Response(JSON.stringify(data || EMPTY_STATE), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const safeBody = {
      checks: body && typeof body.checks === "object" ? body.checks : {},
      customEntries: Array.isArray(body?.customEntries) ? body.customEntries : [],
      settings: body && typeof body.settings === "object" ? body.settings : {},
      updatedAt: new Date().toISOString(),
    };
    await store.setJSON("state", safeBody);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/state",
};
