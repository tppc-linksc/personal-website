import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

function uploadDir(): string {
  const dir = join(process.cwd(), "public", "uploads");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = join(uploadDir(), fileName);

    writeFileSync(filePath, buffer);

    const cover = `/uploads/${fileName}`;
    return NextResponse.json({ cover, ok: true });
  } catch (error) {
    console.error("上传失败", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
