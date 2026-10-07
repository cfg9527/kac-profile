# KaC 嘅像素公園 · KaC's Pixel Park

KaC 的個人自我介紹單頁：一個像素小公園，像素 KaC 四圍行，
㩒公園入面嘅物件（路牌、長凳、大樹、郵箱）就會彈出對應嘅介紹卡。
純靜態、冇後端，Traditional Chinese (HK) 為主，附 EN 切換。

A tiny personal intro page for KaC: walk a pixel park as pixel KaC,
poke the objects (signpost, bench, tree, mailbox) to open matching
Pixel Garden-style intro cards. Fully static, no backend.
Default language is Traditional Chinese (Hong Kong), with an EN toggle.

## 點跑本地 / Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## 點 build / 點 test

```bash
pnpm build      # Next.js build (home page force-static, Neon read at build time)
pnpm test       # Vitest unit tests (content/i18n, object->section mapping, privacy, music + recommend)
pnpm test:e2e   # Playwright e2e, desktop + mobile viewports (needs a build first)
```

GitHub Actions (`ci.yml`) runs typecheck + unit tests + Next.js build +
Playwright e2e on every push and PR. CI sets
`MUSIC_DATA_FIXTURE=e2e/fixtures/entries.json` so no DB secret is needed.

## 改字 / Editing copy

所有文案得一個來源：All copy lives in one file:

- `content/site.ts` — 中英文文案、公園物件對應邊部分、GitHub 連結。
  KaC 改字只需要改呢個檔。
- X 帳號預留位亦喺同一檔：The X handle placeholder is in the same file —
  將 `X_HANDLE` 換成你嘅帳號（例：`"@kac_real"`），聯絡卡就會自動變成連結。

## 部署去 Vercel（KaC 做）/ Deploy to Vercel

目標網址 target URL: `kac-profile.vercel.app`（免費 Hobby plan 即可）。

1. 用 GitHub 帳號登入 Vercel：https://vercel.com/login
2. Add New… → Project → Import `cfg9527/kac-profile`
3. Framework 會自動認到 Next.js；保持預設（Build Command `pnpm build`），㩒 **Deploy**
4. 免費 Hobby plan 唔使加卡；之後每次 merge 入 `main` 會自動重新部署
5. 在 Vercel 專案設定環境變數（見下一節），並將專案 link 去 team（scope ka-c1）以啟用 OIDC

## 結構 / Layout

- `app/page.tsx` — 主頁（Server Component, `force-static`，build time 讀 Neon）
- `app/components/HomeClient.tsx` — 主頁互動部分：標題、語言掣、快捷掣、公園、音樂、推介、註腳
- `app/components/MusicSection.tsx` — 音樂角落：按分類分組 + 詳細 popup（`bodyMd` 安全 markdown）
- `app/components/Recommender.tsx` — 「推介首歌」：置底輸入 + 像素結果對話框
- `app/api/recommend/route.ts` — `POST /api/recommend`（Node.js runtime, Neon 限流 + AI Gateway structured output）
- `lib/music/types.ts` — `Entry` / `RecommendRequest` / `Pick` / `RecommendResponse`
- `lib/music/queries.ts` — `ENTRY_COLUMNS`、`getEntries`、`getSongCandidates`、`checkAndCountUsage`、`visitorHash`
- `lib/music/recommend.ts` — prompt 組裝（只用 slug/title/category/summary）+ `stripWiki`
- `e2e/fixtures/entries.json` — CI/e2e 用音樂 fixture（8–10 行，跨分類）
- `app/components/ParkScene.tsx` — 公園場景 + 行路 + 撳物件
- `app/components/SectionPopup.tsx` — Pixel Garden 風介紹卡
- `app/components/sprites.ts` — 手繪像素圖（原創，無外部素材）
- `content/site.ts` — 唯一文案來源 + X 預留位
- `docs/grill/round-1.md` — 已批准嘅設計決定（唔好重問）
- `.agents/skills/grilling/` — grill skill
- `graphify-out/` — graphify 知識圖（改完 code 跑 `graphify update .`）

## Cursor cloud environment

Future cloud agents boot ready via `.cursor/environment.json`: the `install`
command (`corepack enable && pnpm install --frozen-lockfile`, plus Playwright
chromium and graphify) is idempotent, so re-running it is safe. Node is
pinned to v22 (`.nvmrc`, `engines`, and CI all agree) and pnpm via
`packageManager`. No `start` services needed — the page is fully static;
run `pnpm dev` ad hoc when you need it.

## 私隱 / Privacy

顯示名係「Desmond Cheung」(owner approved 2026-10-05). No photo, no email,
nothing from futa9's private code, keys or internal data.

## 音樂＋推介：環境變數 / Env vars

| Var | Where | Value |
|---|---|---|
| `DATABASE_URL` | Vercel (Prod + Preview) | `site_app` URL（永不 commit） |
| `AI_GATEWAY_MODEL` | Vercel | 由 `/v1/models` 揀嘅平快 model id（唔好 hardcode） |
| `RATE_LIMIT_SALT` | Vercel | 隨機 32+ bytes（用嚟 hash IP，永不存 raw IP） |
| `RECOMMEND_PER_VISITOR_DAILY` / `RECOMMEND_GLOBAL_DAILY` | Vercel (optional) | 5 / 200 |
| `VERCEL_OIDC_TOKEN` | auto on Vercel | 需專案 link 去 team（scope ka-c1） |
| `AI_GATEWAY_API_KEY` | local only | 唔入 CI |
| `MUSIC_DATA_FIXTURE` | CI only (`ci.yml` env) | `e2e/fixtures/entries.json`，CI 唔使 DB secret |

Spend cap（code 以外）：AI Gateway 已經設咗 team-wide US$5/month budget。
用晒會回 402 `quota_for_entity_exceeded`，`/api/recommend` 會轉做 503
`budget_exhausted`（「今個月嘅推介額度用晒，下個月再嚟 🎵」）。

## 歌詞政策 / Lyrics policy

`lyrics_md` 永遠唔可以被 select 或者 render（版權原因）。

- DB 角色用 column-level SELECT 排除咗 `lyrics_md`，`SELECT *` 會直接 error。
- Code 規定：`lib/music/queries.ts` 嘅 `ENTRY_COLUMNS` 只列明需要嘅欄，
  `getEntries` / `getSongCandidates` 唔可以用 `*`，prompt 只可以用
  `slug | title | category | summary`（唔用 `body_md`，更加唔用歌詞）。
- Contract test（`lib/music/queries.test.ts` 第 5 項）會捉：SQL 入面唔可以有
  `lyrics_md` 或者 `*`，`ENTRY_COLUMNS` 唔可以包佢，`app/` + `lib/` 非測試
  source 亦唔可以出現呢個字串。
