import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const DATA_FILE = join(process.cwd(), "data", "visits.json");

function readVisits(): { visits: number } {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as { visits: number };
    }
  } catch { /* ignore */ }
  return { visits: 0 };
}

function writeVisits(data: { visits: number }): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(data), "utf-8");
  renameSync(tempFile, DATA_FILE);
}

export async function GET() {
  const data = readVisits();
  return NextResponse.json(
    { visits: data.visits, enabled: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const data = readVisits();
  data.visits += 1;
  writeVisits(data);
  return NextResponse.json(
    { visits: data.visits, enabled: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
