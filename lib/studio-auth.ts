export const STUDIO_SESSION_COOKIE = "studio_session";

const SESSION_TTL_SECONDS = Number(process.env.STUDIO_SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 3);
const encoder = new TextEncoder();

function getPlainAdminToken(): string {
  return process.env.STUDIO_ADMIN_TOKEN ?? "";
}

function getHashedAdminToken(): string {
  return process.env.STUDIO_ADMIN_TOKEN_HASH ?? "";
}

function getSessionSecret(): string {
  return process.env.STUDIO_SESSION_SECRET || getPlainAdminToken() || getHashedAdminToken();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeStringEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(new Uint8Array(digest));
}

async function hmacHex(secret: string, input: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return toHex(new Uint8Array(signature));
}

function randomHex(size: number): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

function parseSha256Hash(stored: string): { salt: string; expected: string } | null {
  if (!stored) {
    return null;
  }

  const raw = stored.trim();
  if (!raw) {
    return null;
  }

  if (!raw.startsWith("sha256:")) {
    return {
      salt: "",
      expected: raw.toLowerCase(),
    };
  }

  const parts = raw.split(":");
  if (parts.length === 2) {
    return {
      salt: "",
      expected: parts[1].toLowerCase(),
    };
  }

  if (parts.length === 3) {
    return {
      salt: parts[1],
      expected: parts[2].toLowerCase(),
    };
  }

  return null;
}

async function verifyByHash(provided: string): Promise<boolean> {
  const parsed = parseSha256Hash(getHashedAdminToken());
  if (!parsed) {
    return false;
  }

  const payload = parsed.salt ? `${parsed.salt}:${provided}` : provided;
  const computed = await sha256Hex(payload);
  return timingSafeStringEqual(computed.toLowerCase(), parsed.expected);
}

export async function verifyAdminToken(provided: string | null): Promise<boolean> {
  if (!provided) {
    return false;
  }

  const hashed = getHashedAdminToken();
  if (hashed) {
    return verifyByHash(provided);
  }

  const expected = getPlainAdminToken();
  if (!expected) {
    return false;
  }

  return timingSafeStringEqual(provided, expected);
}

export async function createStudioSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Missing STUDIO_SESSION_SECRET or admin token");
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = randomHex(12);
  const payload = `${exp}.${nonce}`;
  const signature = await hmacHex(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifyStudioSession(value: string | undefined): Promise<boolean> {
  if (!value) {
    return false;
  }

  const [expRaw, nonce, signature] = value.split(".");
  if (!expRaw || !nonce || !signature) {
    return false;
  }

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const secret = getSessionSecret();
  if (!secret) {
    return false;
  }

  const payload = `${expRaw}.${nonce}`;
  const expected = await hmacHex(secret, payload);
  return timingSafeStringEqual(signature, expected);
}

export async function isStudioAuthorized(params: {
  tokenHeader?: string | null;
  sessionCookie?: string;
}): Promise<boolean> {
  const byToken = await verifyAdminToken(params.tokenHeader ?? null);
  if (byToken) {
    return true;
  }
  return verifyStudioSession(params.sessionCookie);
}

export function getStudioSessionMaxAge(): number {
  return SESSION_TTL_SECONDS;
}
