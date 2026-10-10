# Graph Report - workspace  (2026-10-07)

## Corpus Check
- 32 files · ~19,191 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 208 nodes · 309 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `68ea07d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ParkScene.tsx
- site.ts
- package.json
- compilerOptions
- devDependencies
- layout.tsx
- queries.ts
- Grilling — design review before building
- Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)
- postcss.config.mjs
- KaC 嘅像素公園 · KaC's Pixel Park
- route.ts
- vitest
- dependencies

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `KaC 嘅像素公園 · KaC's Pixel Park` - 10 edges
3. `結構 / Layout` - 10 edges
4. `ParkScene()` - 7 edges
5. `getEntries()` - 7 edges
6. `getSongCandidates()` - 7 edges
7. `POST()` - 6 edges
8. `HomeClient()` - 6 edges
9. `SectionId` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `結構 / Layout` --references--> `RecommendRequest`  [INFERRED]
  README.md → lib/music/types.ts
- `結構 / Layout` --references--> `RecommendResponse`  [INFERRED]
  README.md → lib/music/types.ts
- `結構 / Layout` --references--> `stripWiki()`  [INFERRED]
  README.md → lib/music/recommend.ts
- `結構 / Layout` --references--> `Entry`  [INFERRED]
  README.md → lib/music/types.ts
- `結構 / Layout` --references--> `Pick`  [INFERRED]
  README.md → lib/music/types.ts

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 0 - "ParkScene.tsx"
Cohesion: 0.12
Nodes (24): adjacentFreeTile(), COLS, DPad(), FLOWERS, OBJECT_SPRITES, OBJECT_TILES, ParkScene(), PATH_TILES (+16 more)

### Community 1 - "site.ts"
Cohesion: 0.15
Nodes (22): HomeClient(), Props, Recommender(), Props, SectionPopup(), dynamic, Home(), GITHUB_URL (+14 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (23): engines, node, pnpm, name, packageManager, private, scripts, build (+15 more)

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
Cohesion: 0.15
Nodes (16): checkAndCountUsage(), ENTRY_COLUMNS, EntryRow, getEntries(), getSongCandidates(), mapRow(), readFixture(), capturedSql() (+8 more)

### Community 7 - "Grilling — design review before building"
Cohesion: 0.50
Nodes (3): Grilling — design review before building, How a grill round works, Rules

### Community 8 - "Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)"
Cohesion: 0.50
Nodes (3): Approved decisions, Follow-ups for KaC (not part of v1), Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)

### Community 11 - "KaC 嘅像素公園 · KaC's Pixel Park"
Cohesion: 0.22
Nodes (8): Cursor cloud environment, KaC 嘅像素公園 · KaC's Pixel Park, 改字 / Editing copy, 私隱 / Privacy, 部署去 Vercel（KaC 做）/ Deploy to Vercel, 音樂＋推介：環境變數 / Env vars, 點 build / 點 test, 點跑本地 / Run locally

### Community 12 - "route.ts"
Cohesion: 0.10
Nodes (23): classifyGatewayError(), collectHaystack(), err(), POST(), CANDIDATES, mockCandidates, mockGenerate, mockUsage (+15 more)

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, ai, @neondatabase/serverless, next, react, react-dom, react-markdown, @vercel/functions (+1 more)

## Knowledge Gaps
- **92 isolated node(s):** `mockGenerate`, `mockCandidates`, `mockUsage`, `CANDIDATES`, `COLS` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 111 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `site.ts` to `ParkScene.tsx`, `package.json`, `route.ts`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `結構 / Layout` (e.g. with `checkAndCountUsage()` and `getEntries()`) actually correct?**
  _`結構 / Layout` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mockGenerate`, `mockCandidates`, `mockUsage` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ParkScene.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `site.ts`, `package.json`, `route.ts`, `queries.ts`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `site.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._
- **Why does `next` connect `layout.tsx` to `package.json`, `route.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._