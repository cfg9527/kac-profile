/* KPP-9 contract: KaC's own self-intro and interests copy.
 *
 * zh: KaC's published text is kept byte for byte in
 * content/__fixtures__/kpp9/{intro,interests}.zh.txt (one paragraph per
 * line). content/site.ts must carry it verbatim as `body` paragraphs: no
 * edits, no polishing, keep the mix of Cantonese and written Chinese.
 *
 * en: faithful literary translation of the same paragraphs, no additions.
 * Status: awaiting KaC review. content/site.ts must use these arrays as the
 * en `body` of the intro and interests sections. */

export const INTRO_EN: readonly string[] = [
  "That drop of water: is it a transparent tear, or a drop of invisible time? It falls gently onto that white porcelain plate, a tiny, almost inaudible sound: \u201cpat.\u201d Then it begins to spread. Not a headlong charge, but a kind of seeping, a soundless encroachment.",
  "Prussian blue. The name itself carries an ancient, mysterious air. It is not ordinary blue; it is the colour of the abyss, the colour of the midnight sky at its stillest moment, the colour of those feelings deep in memory that can never be put into words.",
];

export const INTERESTS_EN: readonly string[] = [
  "Likes taking apart lifeless machines at two in the morning, or letting ink bleed silently across blotting paper into a vast ocean. Fingertips brushing rough cotton paper, cold hard metal chamfers, abandoned architectural blueprints: ruins marked with coordinates yet never built. Sinking into low-frequency vibrations, like the static sent back by a deep-sea probe, without beginning or end; chasing every kind of solitude that has over-fermented, smelling of mould and old leather; collecting the faint trembling of springs behind clocks that stopped running long ago. All warmth is tightly wrapped in sub-zero blues. It does not burn; only, in the deepest dark, it quietly carries out a chemical sedimentation it never intends to make public.",
];
