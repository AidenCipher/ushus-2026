export interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

export const CHRIST_CREST: LogoAsset = { src: "/logos/christ-crest.png", width: 1795, height: 608 };
export const USHUS_EMBLEM: LogoAsset = { src: "/logos/ushus-emblem.png", width: 2735, height: 2717 };

export interface FestEvent {
  name: string;
  codename: string;
  description: string;
  teamSize: number;
  logo: LogoAsset | null;
}

// The ten USHUS '26 IMPERIUM events, each mapped to a historical commander.
export const EVENTS: FestEvent[] = [
  {
    name: "Best Manager",
    codename: "Thronium",
    description:
      "A solo gauntlet of judgment calls, case cracks, and on-the-spot decision-making, testing whether one mind can read a shifting situation faster than it can be explained to them.",
    teamSize: 1,
    logo: { src: "/logos/thronium.png", width: 1254, height: 1254 },
  },
  {
    name: "Best Management Team",
    codename: "Venturium",
    description:
      "A cross-functional simulation where a four-person team must plan, align, and execute a complex operation together, with success depending on coordination as much as individual skill.",
    teamSize: 4,
    logo: { src: "/logos/venturium.png", width: 1254, height: 1254 },
  },
  {
    name: "Human Resource",
    codename: "Synergium",
    description:
      "A people-strategy challenge covering talent acquisition, workforce planning, and organisational design — building the systems that let an organisation mobilise its people effectively.",
    teamSize: 3,
    logo: { src: "/logos/synergium.png", width: 1254, height: 1254 },
  },
  {
    name: "Marketing",
    codename: "Warketium",
    description:
      "A brand and persuasion challenge — positioning, messaging, and go-to-market strategy — judged on how convincingly a team can shape perception and drive action.",
    teamSize: 3,
    logo: { src: "/logos/warketium.png", width: 1254, height: 1254 },
  },
  {
    name: "Business Analytics",
    codename: "Algorium",
    description:
      "A data-driven problem-solving challenge where teams extract signal from noisy, incomplete information and build AI-assisted models to make faster, better decisions.",
    teamSize: 3,
    logo: { src: "/logos/algorium.png", width: 1254, height: 1254 },
  },
  {
    name: "Finance",
    codename: "Aurium",
    description:
      "A capital allocation and financial strategy challenge — valuation, investment decisions, and resource planning under constraint and competition.",
    teamSize: 3,
    logo: { src: "/logos/aurium.png", width: 852, height: 852 },
  },
  {
    name: "Business Plan",
    codename: "Bizarium",
    description:
      "A venture-building challenge that takes a team from a raw idea to a structured, defensible business plan, built to survive scrutiny from a live panel.",
    teamSize: 3,
    logo: { src: "/logos/bizarium.png", width: 1254, height: 1254 },
  },
  {
    name: "Business Quiz",
    codename: "Cognitium",
    description:
      "A high-volume business and current-affairs quiz, moving from a large written prelim to a live buzzer-round finale on stage.",
    teamSize: 3,
    logo: { src: "/logos/cognitium.png", width: 1254, height: 1254 },
  },
  {
    name: "Strategy",
    codename: "Victorium",
    description:
      "A strategic simulation testing long-range thinking, competitive positioning, and the ability to anticipate and counter an opponent's next move.",
    teamSize: 3,
    logo: { src: "/logos/victorium.png", width: 1254, height: 1254 },
  },
  {
    name: "Lean Operations",
    codename: "Kaizenium",
    description:
      "An execution-and-logistics challenge — sequencing, resource movement, and process design — testing whether a plan can actually be run at scale, not just written.",
    teamSize: 3,
    logo: { src: "/logos/kaizenium.png", width: 202, height: 204 },
  },
];
