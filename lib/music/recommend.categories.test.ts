import { describe, expect, it } from "vitest";
import { buildCandidateContext, buildRecommendPrompt, type Candidate } from "./recommend";
import { isCategory } from "./types";

describe("recommend category passthrough", () => {
  it("8. 爵士 candidate passes through context and prompt as-is", () => {
    const candidates: Candidate[] = [
      { slug: "syn-jazz-1", title: "測試爵士甲", category: "爵士", summary: "syn summary jazz" },
    ];
    for (const c of candidates) {
      expect(isCategory(c.category)).toBe(true);
    }
    const ctx = buildCandidateContext(candidates);
    expect(ctx).toContain("syn-jazz-1 | 測試爵士甲 | 爵士 |");
    const prompt = buildRecommendPrompt(candidates, "想聽爵士");
    expect(prompt).toContain("syn-jazz-1 | 測試爵士甲 | 爵士 |");
  });
});
