/**
 * Event-vertical crest logo assets (sourced from the USHUS 2026: IMPERIUM
 * brand kit). Matched by the vertical's *functional* name/keyword — not by
 * whatever flavor-text codename happens to be in its `description` field,
 * since that codename theme can and does drift independently of the crest
 * artwork (e.g. a database seeded with Indian-dynasty codenames instead of
 * the poster's Roman "-ium" codenames still means the same "Best Manager"
 * vertical, which always maps to the Thronium crest).
 *
 * Warketium (Marketing) has no crest asset yet — `getVerticalLogo` returns
 * null for it and callers should fall back to the vertical's colorCode dot.
 */
export interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

const BIZARIUM: LogoAsset = { src: "/logos/bizarium.png", width: 1024, height: 1042 };
const THRONIUM: LogoAsset = { src: "/logos/thronium.jpg", width: 1264, height: 847 };
const VENTURIUM: LogoAsset = { src: "/logos/venturium.png", width: 1254, height: 1254 };
const SYNERGIUM: LogoAsset = { src: "/logos/synergium.png", width: 2528, height: 1694 };
const ALGORIUM: LogoAsset = { src: "/logos/algorium.png", width: 1254, height: 1254 };
const AURIUM: LogoAsset = { src: "/logos/aurium.png", width: 2228, height: 1920 };
const COGNITIUM: LogoAsset = { src: "/logos/cognitium.png", width: 1254, height: 1254 };
const KAIZENIUM: LogoAsset = { src: "/logos/kaizenium.png", width: 1254, height: 1254 };
const VICTORIUM: LogoAsset = { src: "/logos/victorium.png", width: 1254, height: 1254 };

export const CHRIST_CREST: LogoAsset = { src: "/logos/christ-crest.png", width: 1795, height: 608 };

// Ordered by specificity — checked in order, first keyword match wins.
const VERTICAL_LOGO_RULES: Array<{ keywords: string[]; asset: LogoAsset }> = [
  { keywords: ["best management team", "management team"], asset: VENTURIUM },
  { keywords: ["best manager"], asset: THRONIUM },
  { keywords: ["human resource", "hr"], asset: SYNERGIUM },
  { keywords: ["business analytics", "analytics"], asset: ALGORIUM },
  { keywords: ["finance"], asset: AURIUM },
  { keywords: ["business plan", "b-plan"], asset: BIZARIUM },
  { keywords: ["business quiz", "b-quiz"], asset: COGNITIUM },
  { keywords: ["strategy"], asset: VICTORIUM },
  { keywords: ["lean operations", "logistics", "operations"], asset: KAIZENIUM },
  // Marketing (Warketium) intentionally omitted — crest not yet supplied.
];

export function getVerticalLogo(vertical: { name: string }): LogoAsset | null {
  const name = vertical.name.toLowerCase();
  for (const rule of VERTICAL_LOGO_RULES) {
    if (rule.keywords.some((kw) => name.includes(kw))) {
      return rule.asset;
    }
  }
  return null;
}

// lib/content.ts (the static public-site copy) already carries the correct
// Roman "-ium" codenames, so those pages can look up crests directly.
const LOGO_BY_CODENAME: Record<string, LogoAsset> = {
  BIZARIUM,
  THRONIUM,
  VENTURIUM,
  SYNERGIUM,
  ALGORIUM,
  AURIUM,
  COGNITIUM,
  KAIZENIUM,
  VICTORIUM,
};

export function getLogoByCodename(codename: string): LogoAsset | null {
  return LOGO_BY_CODENAME[codename.toUpperCase()] ?? null;
}
