import tcb from "@cloudbase/node-sdk";

const ENV_ID = process.env.CLOUDBASE_ENV_ID;
const ACCESS_KEY = process.env.CLOUDBASE_API_KEY ?? process.env.CLOUDBASE_APIKEY;
const SECRET_ID = process.env.CLOUDBASE_SECRET_ID ?? process.env.TENCENTCLOUD_SECRETID;
const SECRET_KEY = process.env.CLOUDBASE_SECRET_KEY ?? process.env.TENCENTCLOUD_SECRETKEY;
const SESSION_TOKEN = process.env.CLOUDBASE_SESSION_TOKEN ?? process.env.TENCENTCLOUD_SESSIONTOKEN;

let _app: ReturnType<typeof tcb.init> | null = null;

export function isCloudbaseConfigured(): boolean {
  return Boolean(ENV_ID && (ACCESS_KEY || (SECRET_ID && SECRET_KEY)));
}

export function getCloudbaseApp() {
  if (!_app) {
    if (!ENV_ID) {
      throw new Error("Missing CLOUDBASE_ENV_ID");
    }
    _app = tcb.init({
      env: ENV_ID,
      accessKey: ACCESS_KEY,
      secretId: SECRET_ID,
      secretKey: SECRET_KEY,
      sessionToken: SESSION_TOKEN,
    });
  }
  return _app;
}

export function getCloudbaseDb() {
  return getCloudbaseApp().database();
}

export function isCollectionMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybe = error as { message?: unknown; code?: unknown };
  const message = typeof maybe.message === "string" ? maybe.message : "";
  const code = typeof maybe.code === "string" ? maybe.code : "";
  return (
    message.includes("DATABASE_COLLECTION_NOT_EXIST") ||
    message.includes("Db or Table not exist") ||
    code.includes("DATABASE_COLLECTION_NOT_EXIST")
  );
}
