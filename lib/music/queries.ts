import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import type { Entry, SongCandidate } from "./types";
import { isCategory } from "./types";
import { toOntologyLite } from "./shortlist";

// Explicit column list for the entries table. The copyrighted full-text
// column is deliberately absent here and must never be added.
export const ENTRY_COLUMNS =
  "id, slug, title, category, kind, summary, album_ref, body_md, body_truncated";

const MISSING_DB_MESSAGE =
  "DATABASE_URL is not set — the Music section needs Neon at build time (see README)";

interface EntryRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  kind: string;
  summary: string;
  album_ref: string | null;
  body_md: string | null;
  body_truncated: boolean;
}

function mapRow(r: EntryRow): Entry {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category as Entry["category"],
    kind: r.kind as Entry["kind"],
    summary: r.summary,
    albumRef: r.album_ref ?? null,
    bodyMd: r.body_md ?? null,
    bodyTruncated: Boolean(r.body_truncated),
  };
}

function useFixture(): boolean {
  return (
    typeof process.env.MUSIC_DATA_FIXTURE === "string" &&
    process.env.MUSIC_DATA_FIXTURE.length > 0 &&
    process.env.VERCEL_ENV !== "production"
  );
}

async function readFixture(): Promise<Entry[]> {
  const raw = await readFile(process.env.MUSIC_DATA_FIXTURE as string, "utf8");
  const data = JSON.parse(raw) as Array<Record<string, unknown>>;
  const mapped = data.map((r, i) => ({
    id: typeof r.id === "number" ? r.id : i + 1,
    slug: String(r.slug),
    title: String(r.title),
    category: r.category as Entry["category"],
    kind: r.kind as Entry["kind"],
    summary: String(r.summary ?? ""),
    albumRef: (r.albumRef ?? r.album_ref ?? null) as string | null,
    bodyMd: (r.bodyMd ?? r.body_md ?? null) as string | null,
    bodyTruncated: Boolean(r.bodyTruncated ?? r.body_truncated ?? false),
  }));
  const kept: Entry[] = [];
  for (const e of mapped) {
    if (isCategory(e.category)) {
      kept.push(e);
    } else {
      console.warn("[music] dropped entry with unknown category", { slug: e.slug, category: e.category });
    }
  }
  return kept;
}

export async function getEntries(): Promise<Entry[]> {
  if (useFixture()) return readFixture();
  if (!process.env.DATABASE_URL) throw new Error(MISSING_DB_MESSAGE);
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = (await sql`SELECT id, slug, title, category, kind, summary, album_ref, body_md, body_truncated FROM entries ORDER BY category, id`) as unknown as EntryRow[];
    const kept: Entry[] = [];
    for (const e of rows.map(mapRow)) {
      if (isCategory(e.category)) {
        kept.push(e);
      } else {
        console.warn("[music] dropped entry with unknown category", { slug: e.slug, category: e.category });
      }
    }
    return kept;
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load music entries: ${cause}`);
  }
}

// KPP-6 contract: candidates now carry `ontology: OntologyLite | null` (label-only).
export async function getSongCandidates(): Promise<SongCandidate[]> {
  if (useFixture()) {
    const raw = await readFile(process.env.MUSIC_DATA_FIXTURE as string, "utf8");
    const data = JSON.parse(raw) as Array<Record<string, unknown>>;
    const out: SongCandidate[] = [];
    for (const r of data) {
      const category = r["category"] as Entry["category"];
      const kind = (r["kind"] ?? r["Kind"]) as string;
      if (!isCategory(category)) {
        console.warn("[music] dropped entry with unknown category", {
          slug: String(r["slug"]),
          category: r["category"],
        });
        continue;
      }
      if (kind !== "song") continue;
      const slug = String(r["slug"]);
      const title = String(r["title"]);
      const summary = String(r["summary"] ?? "");
      const ontology = toOntologyLite(r["ontology"]);
      out.push({ slug, title, category, summary, ontology });
    }
    return out;
  }
  if (!process.env.DATABASE_URL) throw new Error(MISSING_DB_MESSAGE);
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = (await sql`SELECT slug, title, category, summary, ontology FROM entries WHERE kind = 'song' ORDER BY category, id`) as unknown as Array<{
      slug: string;
      title: string;
      category: Entry["category"];
      summary: string;
      ontology: unknown;
    }>;
    const kept: SongCandidate[] = [];
    for (const r of rows) {
      if (isCategory(r.category)) {
        const slug = r.slug;
        const title = r.title;
        const category = r.category;
        const summary = r.summary;
        const ontology = toOntologyLite(r.ontology);
        kept.push({ slug, title, category, summary, ontology });
      } else {
        console.warn("[music] dropped entry with unknown category", { slug: r.slug, category: r.category });
      }
    }
    return kept;
  } catch (err) {
    if ((err as { code?: unknown })?.code === "42703") {
      console.warn("[music] ontology column missing; recommending without ontology");
      try {
        const sql = neon(process.env.DATABASE_URL);
        const rows = (await sql`SELECT slug, title, category, summary FROM entries WHERE kind = 'song' ORDER BY category, id`) as unknown as Array<{
          slug: string;
          title: string;
          category: Entry["category"];
          summary: string;
        }>;
        const kept: SongCandidate[] = [];
        for (const r of rows) {
          if (isCategory(r.category)) {
            const slug = r.slug;
            const title = r.title;
            const category = r.category;
            const summary = r.summary;
            kept.push({ slug, title, category, summary, ontology: null });
          } else {
            console.warn("[music] dropped entry with unknown category", {
              slug: r.slug,
              category: r.category,
            });
          }
        }
        return kept;
      } catch (err2) {
        const cause = err2 instanceof Error ? err2.message : String(err2);
        throw new Error(`Failed to load music entries: ${cause}`);
      }
    }
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load music entries: ${cause}`);
  }
}

export function visitorHash(ip: string, dayHK: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}:${dayHK}`).digest("hex");
}

export function getDayHK(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function checkAndCountUsage(
  hash: string,
  dayHK: string,
  opts: { perVisitor: number; globalCap: number },
): Promise<"ok" | "rate_limited" | "daily_cap"> {
  const sql = neon(process.env.DATABASE_URL as string);
  const globalRows = (await sql`SELECT coalesce(sum(count),0) AS total FROM recommend_usage WHERE day = ${dayHK}`) as unknown as Array<{
    total: number | string;
  }>;
  const total = Number(globalRows[0]?.total ?? 0);
  if (total >= opts.globalCap) return "daily_cap";
  const updated = (await sql`INSERT INTO recommend_usage (visitor_hash, day, count, last_at) VALUES (${hash}, ${dayHK}, 1, now()) ON CONFLICT (visitor_hash, day) DO UPDATE SET count = recommend_usage.count + 1, last_at = now() WHERE recommend_usage.count < ${opts.perVisitor} RETURNING count`) as unknown as unknown[];
  if (updated.length === 0) return "rate_limited";
  return "ok";
}

export function getClientIp(request: Request): string {
  try {
    // Lazy require so unit tests without Vercel context still work.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ipAddress } = require("@vercel/functions") as {
      ipAddress: (r: Request) => string | undefined;
    };
    const viaHelper = ipAddress(request);
    if (viaHelper) return viaHelper;
  } catch {
    // fall through to header parsing
  }
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return "unknown";
}
