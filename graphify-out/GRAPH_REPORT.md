# Graph Report - workspace  (2026-10-06)

## Corpus Check
- 31 files · ~34,796 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 209 nodes · 322 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c91a3811`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ParkScene.tsx
- HomeClient.tsx
- package.json
- compilerOptions
- devDependencies
- layout.tsx
- queries.ts
- Grilling — design review before building
- Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)
- postcss.config.mjs
- KaC 嘅像素公園 · KaC's Pixel Park
- types.ts
- route.ts
- dependencies

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `KaC 嘅像素公園 · KaC's Pixel Park` - 10 edges
3. `結構 / Layout` - 10 edges
4. `getEntries()` - 9 edges
5. `HomeClient()` - 7 edges
6. `ParkScene()` - 7 edges
7. `getSongCandidates()` - 7 edges
8. `POST()` - 6 edges
9. `SectionId` - 6 edges
10. `Entry` - 6 edges

## Surprising Connections (you probably didn't know these)
- `結構 / Layout` --references--> `getEntries()`  [INFERRED]
  README.md → lib/music/queries.ts
- `結構 / Layout` --references--> `getSongCandidates()`  [INFERRED]
  README.md → lib/music/queries.ts
- `結構 / Layout` --references--> `visitorHash()`  [INFERRED]
  README.md → lib/music/queries.ts
- `結構 / Layout` --references--> `RecommendRequest`  [INFERRED]
  README.md → lib/music/types.ts
- `結構 / Layout` --references--> `RecommendResponse`  [INFERRED]
  README.md → lib/music/types.ts

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "ParkScene.tsx"
Cohesion: 0.12
Nodes (24): adjacentFreeTile(), COLS, DPad(), FLOWERS, OBJECT_SPRITES, OBJECT_TILES, ParkScene(), PATH_TILES (+16 more)

### Community 1 - "HomeClient.tsx"
Cohesion: 0.19
Nodes (18): Props, Props, SectionPopup(), GITHUB_URL, Lang, LANG_STORAGE_KEY, OBJECT_SECTION_MAP, PARK_OBJECT_IDS (+10 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (22): engines, node, pnpm, name, packageManager, private, scripts, build (+14 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @playwright/test, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 5 - "layout.tsx"
Cohesion: 0.25
Nodes (4): metadata, nunito, nextConfig, next

### Community 6 - "queries.ts"
Cohesion: 0.12
Nodes (17): HomeClient(), Recommender(), dynamic, Home(), ENTRY_COLUMNS, EntryRow, getEntries(), getSongCandidates() (+9 more)

### Community 7 - "Grilling — design review before building"
Cohesion: 0.50
Nodes (3): Grilling — design review before building, How a grill round works, Rules

### Community 8 - "Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)"
Cohesion: 0.50
Nodes (3): Approved decisions, Follow-ups for KaC (not part of v1), Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)

### Community 11 - "KaC 嘅像素公園 · KaC's Pixel Park"
Cohesion: 0.22
Nodes (8): Cursor cloud environment, KaC 嘅像素公園 · KaC's Pixel Park, 改字 / Editing copy, 私隱 / Privacy, 部署去 Vercel（KaC 做）/ Deploy to Vercel, 音樂＋推介：環境變數 / Env vars, 點 build / 點 test, 點跑本地 / Run locally

### Community 12 - "types.ts"
Cohesion: 0.13
Nodes (20): EntryPopup(), MusicSection(), ORDER, FALLBACK, Status, checkAndCountUsage(), buildCandidateContext(), buildRecommendPrompt() (+12 more)

### Community 13 - "route.ts"
Cohesion: 0.17
Nodes (11): classifyGatewayError(), collectHaystack(), err(), POST(), CANDIDATES, mockCandidates, mockGenerate, mockUsage (+3 more)

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, ai, @neondatabase/serverless, next, react, react-dom, react-markdown, @vercel/functions (+1 more)

## Knowledge Gaps
- **92 isolated node(s):** `mockGenerate`, `mockCandidates`, `mockUsage`, `CANDIDATES`, `ORDER` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 111 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `HomeClient.tsx` to `ParkScene.tsx`, `package.json`, `types.ts`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `結構 / Layout` (e.g. with `checkAndCountUsage()` and `getEntries()`) actually correct?**
  _`結構 / Layout` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mockGenerate`, `mockCandidates`, `mockUsage` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ParkScene.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `route.ts` to `HomeClient.tsx`, `package.json`, `queries.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `getEntries()` (e.g. with `mapRow()` and `歌詞政策 / Lyrics policy`) actually correct?**
  _`getEntries()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._