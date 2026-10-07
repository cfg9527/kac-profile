import { readFileSync } from "node:fs";
import { validateOntology } from "../lib/music/ontology";

function main(): void {
  const [, , ontologyPath, bodyPath, lyricsPath] = process.argv;
  if (!ontologyPath || !bodyPath) {
    console.error("Usage: ontology-validate <ontology.json> <body.md> [lyrics.md]");
    process.exit(1);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(ontologyPath, "utf8"));
  } catch (e) {
    console.log(JSON.stringify({ ok: false, errors: [`ontology file: ${(e as Error).message}`] }));
    process.exit(1);
  }
  const bodyMd = readFileSync(bodyPath, "utf8");
  const lyricsMd = lyricsPath ? readFileSync(lyricsPath, "utf8") : null;
  const result = validateOntology(raw, { bodyMd, lyricsMd });
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}

main();
