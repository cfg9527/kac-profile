# Grill round 1 — kac-profile v1 (approved by KaC, 2026-10-03)

Source: Jira KPP-1（KaC 全部照建議批准）. The `uploads/` attachments
referenced in the original task were not present in the workspace, so the
decisions below are reconstructed from the KPP-1 spec and the task summary.
KaC: correct this file if anything drifted.

## Approved decisions

1. **Stack**: Next.js App Router + TypeScript + Tailwind v4 + pnpm,
   with `output: "export"` static export. No backend. Rationale: matches
   KaC's other project and deploys on Vercel free Hobby as pure static.
2. **Play**: single static page — a pixel character walks a pixel park;
   clicking/tapping an object opens the matching section in a Pixel
   Garden-style card. Keyboard arrows/WASD on desktop; on-screen pad plus
   tap-to-walk on mobile; plain shortcut buttons as accessible fallback,
   popups closable with Esc.
3. **Content**: 4 sections — (a) one-line intro, (b) interests + ENTP,
   (c) projects futa9 / QRNG / 閱微 one line each, high level only,
   (d) contact with GitHub https://github.com/cfg9527 and an X handle
   placeholder in one config file. All copy lives in `content/site.ts`.
4. **Privacy (hard rule, never re-grilled)**: only the name "KaC".
   No real name, photo, email, or anything from futa9's private code,
   keys, or internal data.
5. **Language**: Traditional Chinese (HK) default with an EN toggle,
   choice remembered in `localStorage`.
6. **Repo hygiene**: graphify (`graphify update .`, commit `graphify-out/`),
   graphify Cursor rule, grilling skill under `.agents/skills/grilling/`,
   decisions recorded here. PR into `main`, no self-merge (KaC approves).

## Follow-ups for KaC (not part of v1)

- Fill in the X handle in `content/site.ts` (`X_HANDLE`).
- Vercel: log in with GitHub → Import `cfg9527/kac-profile` → Deploy
  (free Hobby) → target URL `kac-profile.vercel.app`.
