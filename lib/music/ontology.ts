import { z } from "zod";

const Evidence = z.string().min(4).max(200); // verbatim quote copied from the page's analysis text

export const OntologySchema = z.object({
  version: z.literal(1),
  song: z.object({
    title: z.string().min(1),
    artist: z.string().min(1).nullable(),
    album: z.string().min(1).nullable(),
    year: z.number().int().min(1900).max(2100).nullable(),
  }),
  theme: z
    .array(z.object({ label: z.string().min(1).max(40), evidence: Evidence }))
    .min(1)
    .max(5),
  emotions: z
    .array(
      z.object({
        label: z.string().min(1).max(20),
        intensity: z.number().int().min(1).max(5),
        evidence: Evidence,
      }),
    )
    .max(6),
  timeline: z
    .array(
      z.object({
        when: z.string().min(1).max(40),
        kind: z.enum(["date", "year", "decade", "era", "season", "time_of_day"]),
        evidence: Evidence,
      }),
    )
    .max(8),
  causality: z
    .array(
      z.object({
        cause: z.string().min(1).max(80),
        effect: z.string().min(1).max(80),
        evidence: Evidence,
      }),
    )
    .max(6),
  imagery: z
    .array(z.object({ label: z.string().min(1).max(30), evidence: Evidence }))
    .max(10),
  links: z
    .array(
      z.object({
        target: z.string().min(1).max(80),
        type: z.enum(["song", "person", "album", "film", "other"]),
        evidence: Evidence,
      }),
    )
    .max(10),
}).strict();

export type Ontology = z.infer<typeof OntologySchema>;

export interface OntologySource {
  bodyMd: string;
  lyricsMd: string | null;
}

export type ValidateResult = { ok: true; value: Ontology } | { ok: false; errors: string[] };

function normalize(s: string): string {
  return s.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function collectEvidences(raw: unknown): Array<{ path: string; value: unknown }> {
  const out: Array<{ path: string; value: unknown }> = [];
  if (typeof raw !== "object" || raw === null) return out;
  const obj = raw as Record<string, unknown>;
  for (const key of ["theme", "emotions", "timeline", "causality", "imagery", "links"]) {
    const arr = obj[key];
    if (!Array.isArray(arr)) continue;
    arr.forEach((item, i) => {
      if (typeof item === "object" && item !== null) {
        const ev = (item as Record<string, unknown>).evidence;
        out.push({ path: `${key}.${i}.evidence`, value: ev });
      } else {
        out.push({ path: `${key}.${i}.evidence`, value: undefined });
      }
    });
  }
  return out;
}

function collectStrings(raw: unknown, base = ""): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = [];
  if (typeof raw === "string") {
    out.push({ path: base || "(root)", value: raw });
    return out;
  }
  if (Array.isArray(raw)) {
    raw.forEach((item, i) => {
      out.push(...collectStrings(item, base ? `${base}.${i}` : `${i}`));
    });
    return out;
  }
  if (typeof raw === "object" && raw !== null) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out.push(...collectStrings(v, base ? `${base}.${k}` : k));
    }
  }
  return out;
}

export function validateOntology(raw: unknown, source: OntologySource): ValidateResult {
  try {
    const errors: string[] = [];

    const parsed = OntologySchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const p = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        errors.push(`${p}: ${issue.message}`);
      }
    }

    const bodyMd = typeof source?.bodyMd === "string" ? source.bodyMd : "";
    const normBody = normalize(bodyMd);

    for (const { path, value } of collectEvidences(raw)) {
      if (typeof value !== "string") continue;
      if (!normBody.includes(normalize(value))) {
        errors.push(`${path}: evidence not grounded in bodyMd`);
      }
    }

    let year: unknown = null;
    if (typeof raw === "object" && raw !== null) {
      const song = (raw as Record<string, unknown>).song;
      if (typeof song === "object" && song !== null) {
        year = (song as Record<string, unknown>).year ?? null;
      }
    }
    if (typeof year === "number" && Number.isInteger(year)) {
      if (!normBody.includes(String(year))) {
        errors.push(`song.year: year ${String(year)} not found in bodyMd`);
      }
    }

    const lyricsMd = source?.lyricsMd;
    if (typeof lyricsMd === "string" && lyricsMd.length > 0) {
      const lines = lyricsMd
        .split("\n")
        .map((l) => normalize(l))
        .filter((l) => l.length >= 6);
      if (lines.length > 0) {
        const strings = collectStrings(raw);
        for (const line of lines) {
          for (const { path, value } of strings) {
            if (normalize(value).includes(line)) {
              errors.push(
                `${path}: lyrics leak — ontology string contains lyrics line ${JSON.stringify(line)}`,
              );
              break;
            }
          }
        }
      }
    }

    if (errors.length > 0) return { ok: false, errors };
    if (parsed.success) return { ok: true, value: parsed.data };
    return { ok: false, errors: errors.length > 0 ? errors : ["invalid ontology"] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`internal: ${msg}`] };
  }
}
