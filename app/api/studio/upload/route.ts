import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import crypto from "node:crypto";
import { isStudioAuthorized, STUDIO_SESSION_COOKIE } from "@/lib/studio-auth";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_SIZE = 5 * 1024 * 1024;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];
const GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
const GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];

function resolveUploadDir(): string {
  const dataDir = process.env.PORTFOLIO_DATA_DIR || join(process.cwd(), "data");
  const dir = join(dataDir, "uploads");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function extFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot).toLowerCase();
}

function bytesMatch(buffer: Buffer, offset: number, bytes: number[]): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, i) => buffer[offset + i] === byte);
}

function verifySignature(buffer: Buffer, expectedExt: string): boolean {
  if (expectedExt === ".jpg" || expectedExt === ".jpeg") {
    return bytesMatch(buffer, 0, JPEG_SIGNATURE);
  }

  if (expectedExt === ".png") {
    return bytesMatch(buffer, 0, PNG_SIGNATURE);
  }

  if (expectedExt === ".webp") {
    return bytesMatch(buffer, 0, RIFF_SIGNATURE) && bytesMatch(buffer, 8, WEBP_SIGNATURE);
  }

  if (expectedExt === ".gif") {
    return bytesMatch(buffer, 0, GIF87A_SIGNATURE) || bytesMatch(buffer, 0, GIF89A_SIGNATURE);
  }

  return false;
}

async function ensureAdmin(request: NextRequest): Promise<boolean> {
  return isStudioAuthorized({
    tokenHeader: request.headers.get("x-studio-token"),
    sessionCookie: request.cookies.get(STUDIO_SESSION_COOKIE)?.value,
  });
}

export async function POST(request: NextRequest) {
  if (!(await ensureAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    const ext = extFromName(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "不支持的文件类型，仅允许 jpg/png/webp/gif" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!verifySignature(buffer, ext)) {
      return NextResponse.json({ error: "文件签名不匹配，请上传真实图片" }, { status: 400 });
    }

    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = join(resolveUploadDir(), fileName);

    writeFileSync(filePath, buffer);

    const cover = `/api/uploads/${fileName}`;
    return NextResponse.json({ cover, ok: true });
  } catch (error) {
    console.error("上传失败", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
