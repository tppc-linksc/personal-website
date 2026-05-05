#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";

const token = process.argv[2];
if (!token) {
  console.error("Usage: node scripts/studio-token-hash.mjs <your-plain-token>");
  process.exit(1);
}

const salt = randomBytes(12).toString("hex");
const hash = createHash("sha256").update(`${salt}:${token}`).digest("hex");
console.log(`sha256:${salt}:${hash}`);
