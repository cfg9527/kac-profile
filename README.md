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
pnpm build      # static export -> out/
pnpm test       # Vitest unit tests (content/i18n, object->section mapping, privacy)
pnpm test:e2e   # Playwright e2e, desktop + mobile viewports (needs a build first)
```

GitHub Actions (`ci.yml`) runs typecheck + unit tests + static build +
Playwright e2e on every push and PR.

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
3. Framework 會自動認到 Next.js；保持預設（Build Command `pnpm build`，
   Output Directory `out/` 會由 `output: "export"` 自動處理），㩒 **Deploy**
4. 免費 Hobby plan 唔使加卡；之後每次 merge 入 `main` 會自動重新部署

## 結構 / Layout

- `app/page.tsx` — 主頁：標題、語言掣、快捷掣、公園、註腳
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
