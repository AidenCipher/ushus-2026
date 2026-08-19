export interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

export const CHRIST_CREST: LogoAsset = { src: "/logos/christ-crest.png", width: 1795, height: 608 };

export interface FestEvent {
  name: string;
  teamSize: number;
  logo: LogoAsset | null;
}

// The ten USHUS 2026 events. Marketing has no crest artwork yet — its card
// falls back to a plain badge instead of a broken image.
export const EVENTS: FestEvent[] = [
  { name: "Best Manager", teamSize: 1, logo: { src: "/logos/thronium.jpg", width: 1264, height: 847 } },
  { name: "Best Management Team", teamSize: 4, logo: { src: "/logos/venturium.png", width: 1254, height: 1254 } },
  { name: "Human Resource", teamSize: 3, logo: { src: "/logos/synergium.png", width: 2528, height: 1694 } },
  { name: "Marketing", teamSize: 3, logo: null },
  { name: "Business Analytics", teamSize: 3, logo: { src: "/logos/algorium.png", width: 1254, height: 1254 } },
  { name: "Finance", teamSize: 3, logo: { src: "/logos/aurium.png", width: 2228, height: 1920 } },
  { name: "Business Plan", teamSize: 3, logo: { src: "/logos/bizarium.png", width: 1024, height: 1042 } },
  { name: "Business Quiz", teamSize: 3, logo: { src: "/logos/cognitium.png", width: 1254, height: 1254 } },
  { name: "Strategy", teamSize: 3, logo: { src: "/logos/victorium.png", width: 1254, height: 1254 } },
  { name: "Lean Operations", teamSize: 3, logo: { src: "/logos/kaizenium.png", width: 1254, height: 1254 } },
];
