import { NextRequest, NextResponse } from "next/server";
import { isCloudbaseEnabled } from "@/lib/projects-source";
import { uploadCoverToCloudbase } from "@/lib/cloudbase-projects";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const authorized = await isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });

  if (!authorized) {
    return unauthorized();
  }

  if (!isCloudbaseEnabled()) {
    return NextResponse.json({ error: "CloudBase is not configured" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadCoverToCloudbase({
      fileName: file.name,
      fileContent: buffer,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/studio/upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
