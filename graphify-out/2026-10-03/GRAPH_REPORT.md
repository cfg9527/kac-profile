# Graph Report - workspace  (2026-10-03)

## Corpus Check
- 20 files · ~4,915 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .ico 1, .css 1, .tsbuildinfo 1)

## Summary
- 129 nodes · 174 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b6f3a2a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ParkScene.tsx
- site.ts
- package.json
- compilerOptions
- devDependencies
- layout.tsx
- scripts
- Grilling — design review before building
- Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)
- postcss.config.mjs
- README.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `ParkScene()` - 7 edges
3. `SectionId` - 6 edges
4. `scripts` - 6 edges
5. `SiteCopy` - 5 edges
6. `react` - 4 edges
7. `tileBlocked()` - 3 edges
8. `adjacentFreeTile()` - 3 edges
9. `Props` - 3 edges
10. `PixelSprite()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `SectionId`  [EXTRACTED]
  app/components/ParkScene.tsx → content/site.ts
- `Props` --references--> `SiteCopy`  [EXTRACTED]
  app/components/ParkScene.tsx → content/site.ts
- `Props` --references--> `SectionId`  [EXTRACTED]
  app/components/SectionPopup.tsx → content/site.ts
- `Props` --references--> `SiteCopy`  [EXTRACTED]
  app/components/SectionPopup.tsx → content/site.ts
- `Home()` --calls--> `ParkScene()`  [EXTRACTED]
  app/page.tsx → app/components/ParkScene.tsx

## Import Cycles
- None detected.

## Communities (12 total, 3 thin omitted)

### Community 0 - "ParkScene.tsx"
Cohesion: 0.12
Nodes (24): adjacentFreeTile(), COLS, DPad(), FLOWERS, OBJECT_SPRITES, OBJECT_TILES, ParkScene(), PATH_TILES (+16 more)

### Community 1 - "site.ts"
Cohesion: 0.19
Nodes (19): Props, Props, SectionPopup(), Home(), GITHUB_URL, Lang, LANG_STORAGE_KEY, OBJECT_SECTION_MAP (+11 more)

### Community 2 - "package.json"
Cohesion: 0.10
Nodes (17): dependencies, next, react, react-dom, name, packageManager, private, version (+9 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @playwright/test, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 5 - "layout.tsx"
Cohesion: 0.25
Nodes (4): metadata, nunito, nextConfig, next

### Community 6 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, test:e2e

### Community 7 - "Grilling — design review before building"
Cohesion: 0.50
Nodes (3): Grilling — design review before building, How a grill round works, Rules

### Community 8 - "Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)"
Cohesion: 0.50
Nodes (3): Approved decisions, Follow-ups for KaC (not part of v1), Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)

## Knowledge Gaps
- **64 isolated node(s):** `COLS`, `ROWS`, `Tile`, `OBJECT_TILES`, `OBJECT_SPRITES` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 76 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `site.ts` to `ParkScene.tsx`, `package.json`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `next` connect `layout.tsx` to `package.json`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `COLS`, `ROWS`, `Tile` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ParkScene.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._