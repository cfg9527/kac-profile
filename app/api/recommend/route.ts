import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output, gateway } from "ai";
import { buildRecommendPrompt } from "@/lib/music/recommend";
import type { RecommendErrorCode } from "@/lib/music/types";

function err(status: number, error: RecommendErrorCode, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function collectHaystack(errValue: unknown): { text: string; status?: number } {
  const parts: string[] = [];
  let status: number | undefined;
  const seen = new Set<unknown>();
  let cur: unknown = errValue;
  for (let i = 0; i < 6 && cur && typeof cur === "object" && !seen.has(cur); i++) {
    seen.add(cur);
    const r = cur as Record<string, unknown>;
    for (const k of ["message", "type", "code", "name", "status", "statusCode"]) {
      const v = r[k];
      if (typeof v === "string" || typeof v === "number") parts.push(String(v));
    }
    if (typeof r.statusCode === "number") status = r.statusCode;
    else if (typeof r.status === "number") status = r.status;
    const resp = r.response as Record<string, unknown> | undefined;
    if (resp && typeof resp === "object") {
      for (const k of ["status", "statusCode", "body", "data"]) {
        const v = resp[k];
        if (typeof v === "string" || typeof v === "number") parts.push(String(v));
        else if (v && typeof v === "object") {
          try {
            parts.push(JSON.stringify(v));
          } catch {
            // ignore
          }
        }
      }
      if (typeof resp.status === "number") status = resp.status;
      if (typeof resp.statusCode === "number") status = resp.statusCode;
    }
    if (r.data && typeof r.data === "object") {
      try {
        parts.push(JSON.stringify(r.data));
      } catch {
        // ignore
      }
    }
    try {
      parts.push(JSON.stringify(cur));
    } catch {
      // ignore circular
    }
    cur = (r.cause ?? r.error) as unknown;
  }
  if (errValue instanceof Error && !parts.includes(errValue.message)) {
    parts.push(errValue.message);
  }
  return { text: parts.join("\n"), status };
}

function classifyGatewayError(
  e: unknown,
): "budget_exhausted" | "gateway_rate_limited" | "gateway_error" {
  const { text, status } = collectHaystack(e);
  const lower = text.toLowerCase();
  if (text.includes("quota_for_entity_exceeded")) return "budget_exhausted";
  if (
    status === 402 &&
    (lower.includes("insufficient_funds") || lower.includes("insufficient funds"))
  ) {
    return "budget_exhausted";
  }
  if (status === 429 || text.includes("rate_limit_exceeded")) return "gateway_rate_limited";
  return "gateway_error";
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return err(400, "invalid_input", "請講下你嘅心情（1 至 300 字）");
  }
  const rawQuery = (parsed as { query?: unknown }).query;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  if (query.length < 1 || query.length > 300) {
    return err(400, "invalid_input", "請講下你嘅心情（1 至 300 字）");
  }

  const modelId = process.env.AI_GATEWAY_MODEL;
  const salt = process.env.RATE_LIMIT_SALT;
  if (!modelId || !salt) {
    console.error("[recommend] missing config: AI_GATEWAY_MODEL or RATE_LIMIT_SALT is not set");
    return err(500, "config", "伺服器未設定好，請稍後再試");
  }

  const perVisitor = Number(process.env.RECOMMEND_PER_VISITOR_DAILY ?? 5) || 5;
  const globalCap = Number(process.env.RECOMMEND_GLOBAL_DAILY ?? 200) || 200;

  // Dynamic import so unit tests can mock the queries module.
  const queries = await import("@/lib/music/queries");
  const dayHK = queries.getDayHK();
  const ip = queries.getClientIp(request);
  const hash = queries.visitorHash(ip, dayHK, salt);

  try {
    const usage = await queries.checkAndCountUsage(hash, dayHK, { perVisitor, globalCap });
    if (usage === "rate_limited") {
      return err(429, "rate_limited", "你今日已經撳咗好多次啦，聽日再嚟啦 🎵");
    }
    if (usage === "daily_cap") {
      return err(429, "daily_cap", "今日太多人用緊，聽日再嚟啦 🎵");
    }
  } catch (e) {
    console.error("[recommend] usage check failed", e);
    return err(502, "gateway_error", "推介服務暫時用唔到，稍後再試 🎵");
  }

  let candidates: Awaited<ReturnType<typeof queries.getSongCandidates>>;
  try {
    candidates = await queries.getSongCandidates();
  } catch (e) {
    console.error("[recommend] candidate load failed", e);
    return err(502, "gateway_error", "推介服務暫時用唔到，稍後再試 🎵");
  }
  if (candidates.length === 0) {
    return err(502, "gateway_error", "揀唔到歌，試多次？");
  }

  const slugs = candidates.map((c) => c.slug);
  const schema = z.object({
    picks: z
      .array(
        z.object({ slug: z.enum(slugs as [string, ...string[]]), reason: z.string().max(120) }),
      )
      .min(1)
      .max(3),
  });

  let generated: { picks: { slug: string; reason: string }[] };
  try {
    const result = await generateText({
      model: gateway(modelId),
      output: Output.object({ schema }),
      maxOutputTokens: 400,
      temperature: 0.3,
      prompt: buildRecommendPrompt(candidates, query),
    });
    generated = result.output as { picks: { slug: string; reason: string }[] };
  } catch (e) {
    const kind = classifyGatewayError(e);
    if (kind === "budget_exhausted") {
      return err(503, "budget_exhausted", "今個月嘅推介額度用晒，下個月再嚟 🎵");
    }
    if (kind === "gateway_rate_limited") {
      return err(503, "gateway_rate_limited", "太多人撳緊，等陣再試");
    }
    console.error("[recommend] gateway failed", e);
    return err(502, "gateway_error", "推介服務暫時用唔到，稍後再試 🎵");
  }

  const bySlug = new Map(candidates.map((c) => [c.slug, c]));
  const seen = new Set<string>();
  const picks: { slug: string; title: string; category: string; reason: string }[] = [];
  for (const p of generated.picks ?? []) {
    if (!p || typeof p.slug !== "string") continue;
    if (seen.has(p.slug)) continue;
    const hit = bySlug.get(p.slug);
    if (!hit) continue;
    seen.add(p.slug);
    picks.push({
      slug: hit.slug,
      title: hit.title,
      category: hit.category,
      reason: String(p.reason ?? "").slice(0, 120),
    });
    if (picks.length >= 3) break;
  }
  if (picks.length === 0) {
    return err(502, "gateway_error", "揀唔到歌，試多次？");
  }
  return NextResponse.json({ ok: true, picks });
}
