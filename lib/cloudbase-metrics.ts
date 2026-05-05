import { isCloudbaseConfigured, getCloudbaseDb, isCollectionMissingError } from "@/lib/cloudbase";

const COLLECTION = process.env.CLOUDBASE_METRICS_COLLECTION ?? "portfolio_metrics";
const VISITS_DOC_ID = "site_visits";
const getDb = getCloudbaseDb;
const isConfigured = isCloudbaseConfigured;

function isDocumentMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybe = error as { message?: unknown; code?: unknown };
  const message = typeof maybe.message === "string" ? maybe.message : "";
  const code = typeof maybe.code === "string" ? maybe.code : "";
  return message.includes("document not exist") || code.includes("DOCUMENT_NOT_EXIST");
}

function normalizeVisits(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }
  const record = value as Record<string, unknown>;
  return typeof record.visits === "number" && Number.isFinite(record.visits) ? Math.max(0, record.visits) : 0;
}

async function ensureMetricsCollectionAndDoc(): Promise<void> {
  const db = getDb();

  try {
    const result = await db.collection(COLLECTION).doc(VISITS_DOC_ID).get();
    if (result.data?.length > 0) {
      return;
    }
  } catch (error) {
    if (!isCollectionMissingError(error) && !isDocumentMissingError(error)) {
      throw error;
    }

    if (isCollectionMissingError(error)) {
      try {
        await db.createCollection(COLLECTION);
      } catch (createError) {
        if (!isCollectionMissingError(createError)) {
          throw createError;
        }
      }
    }
  }

  await db.collection(COLLECTION).doc(VISITS_DOC_ID).set({
    visits: 0,
    updatedAt: Date.now(),
  });
}

export async function getSiteVisits(): Promise<number | null> {
  if (!isConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const result = await db.collection(COLLECTION).doc(VISITS_DOC_ID).get();
    return normalizeVisits(result.data?.[0]);
  } catch (error) {
    if (isCollectionMissingError(error) || isDocumentMissingError(error)) {
      return 0;
    }
    throw error;
  }
}

export async function incrementSiteVisits(): Promise<number | null> {
  if (!isConfigured()) {
    return null;
  }

  await ensureMetricsCollectionAndDoc();

  const db = getDb();
  await db.collection(COLLECTION).doc(VISITS_DOC_ID).update({
    visits: db.command.inc(1),
    updatedAt: Date.now(),
  });

  return getSiteVisits();
}
