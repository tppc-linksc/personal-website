import { NextResponse } from "next/server";
import { getSiteVisits, incrementSiteVisits } from "@/lib/cloudbase-metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const visits = await getSiteVisits();
    return NextResponse.json(
      { visits, enabled: visits !== null },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/metrics/visits failed", error);
    return NextResponse.json({ visits: null, enabled: false }, { status: 200 });
  }
}

export async function POST() {
  try {
    const visits = await incrementSiteVisits();
    return NextResponse.json(
      { visits, enabled: visits !== null },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("POST /api/metrics/visits failed", error);
    return NextResponse.json({ visits: null, enabled: false }, { status: 200 });
  }
}
