# Graph Report - workspace  (2026-10-10)

## Corpus Check
- 77 files · ~36,499 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 395 nodes · 711 edges · 21 communities (13 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0bca5207`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ParkScene.tsx
- site.ts
- package.json
- compilerOptions
- devDependencies
- shortlist.ts
- queries.ts
- Grilling — design review before building
- tokens.test.ts
- postcss.config.mjs
- ontology.ts
- vitest
- ref_node_path
- route.shortlist.test.ts
- lyric.body.md
- nodate.body.md
- normal.body.md
- ungrounded.body.md

## God Nodes (most connected - your core abstractions)
1. `vitest` - 27 edges
2. `compilerOptions` - 16 edges
3. `getSongCandidates()` - 13 edges
4. `POST()` - 12 edges
5. `shortlistCandidates()` - 10 edges
6. `KaC 嘅像素公園 · KaC's Pixel Park` - 10 edges
7. `結構 / Layout` - 10 edges
8. `getEntries()` - 9 edges
9. `@playwright/test` - 9 edges
10. `buildRecommendPrompt()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `結構 / Layout` --references--> `checkAndCountUsage()`  [INFERRED]
  README.md → lib/music/queries.ts
- `結構 / Layout` --references--> `stripWiki()`  [INFERRED]
  README.md → lib/music/recommend.ts
- `結構 / Layout` --references--> `RecommendRequest`  [INFERRED]
  README.md → lib/music/types.ts
- `結構 / Layout` --references--> `RecommendResponse`  [INFERRED]
  README.md → lib/music/types.ts
- `歌詞政策 / Lyrics policy` --references--> `getEntries()`  [INFERRED]
  README.md → lib/music/queries.ts

## Import Cycles
- None detected.

## Communities (21 total, 8 thin omitted)

### Community 0 - "ParkScene.tsx"
Cohesion: 0.12
Nodes (24): adjacentFreeTile(), COLS, FLOWERS, OBJECT_SPRITES, OBJECT_TILES, ParkScene(), PATH_TILES, POND_TILES (+16 more)

### Community 1 - "site.ts"
Cohesion: 0.07
Nodes (38): DreamBackdrop(), HomeClient(), Props, FALLBACK, Recommender(), Status, Props, SectionPopup() (+30 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): metadata, nunito, nextConfig, dependencies, ai, @neondatabase/serverless, next, react (+30 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, @playwright/test, tailwindcss, @tailwindcss/postcss, tsx, @types/node, @types/react, @types/react-dom (+2 more)

### Community 5 - "shortlist.ts"
Cohesion: 0.11
Nodes (32): countDistinctGramsInLabels(), countDistinctGramsInText(), extractLabels(), FIELD_WEIGHTS, flushCjkRun(), fnv1a32(), isCjkChar(), isLetterOrNumber() (+24 more)

### Community 6 - "queries.ts"
Cohesion: 0.08
Nodes (29): NEW, OLD, MIGRATION_PATH, mockSql, ENTRY_COLUMNS, EntryRow, getEntries(), getSongCandidates() (+21 more)

### Community 7 - "Grilling — design review before building"
Cohesion: 0.50
Nodes (3): Grilling — design review before building, How a grill round works, Rules

### Community 8 - "tokens.test.ts"
Cohesion: 0.10
Nodes (15): hexLum(), lum(), AA_LARGE, AA_NORMAL, contrastRatio(), cssVarName(), DREAM_COLORS, DreamColorName (+7 more)

### Community 11 - "ontology.ts"
Cohesion: 0.08
Nodes (23): Approved decisions, Follow-ups for KaC (not part of v1), Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03), collectEvidences(), collectStrings(), Evidence, normalize(), Ontology (+15 more)

### Community 12 - "vitest"
Cohesion: 0.11
Nodes (29): classifyGatewayError(), collectHaystack(), err(), mockGenerate, POST(), CANDIDATES, mockCandidates, mockGenerate (+21 more)

### Community 13 - "ref_node_path"
Cohesion: 0.13
Nodes (13): DREAM_GLINTS, DREAM_STARS, DreamGlint, DreamStar, SEA_TESTID, SKY_TESTID, STAR_PIXEL, STAR_TESTID (+5 more)

### Community 14 - "route.shortlist.test.ts"
Cohesion: 0.16
Nodes (11): acceptedSlugs(), ALL_SLUGS, catalog(), CATS, GenArgs, lite(), mockCandidates, mockGenerate (+3 more)

## Knowledge Gaps
- **10 isolated node(s):** `@vercel/functions`, `react-dom`, `react-markdown`, `@tailwindcss/postcss`, `@types/node` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 200 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `site.ts`, `package.json`, `shortlist.ts`, `queries.ts`, `tokens.test.ts`, `ontology.ts`, `ref_node_path`, `route.shortlist.test.ts`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `getSongCandidates()` (e.g. with `route.kpp7b.test.ts` and `route.shortlist.test.ts`) actually correct?**
  _`getSongCandidates()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@vercel/functions`, `react-dom`, `react-markdown` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ParkScene.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `tokens.test.ts` to `site.ts`, `package.json`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `site.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06641604010025062 - nodes in this community are weakly interconnected._
- **Why does `react` connect `site.ts` to `ParkScene.tsx`, `package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._