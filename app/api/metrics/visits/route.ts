import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const row = db.prepare(`SELECT value FROM metrics WHERE key = 'visits'`).get() as { value: number } | undefined;
  const visits = row?.value ?? 0;
  return NextResponse.json(
    { visits, enabled: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO metrics (key, value, updated_at)
    VALUES ('visits', 1, ?)
    ON CONFLICT(key)
    DO UPDATE SET value = value + 1, updated_at = excluded.updated_at
    RETURNING value
  `).get(now) as { value: number } | undefined;
  const visits = result?.value ?? 0;
  return NextResponse.json(
    { visits, enabled: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
