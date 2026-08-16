/**
 * USHUS 2026 — Fest Content Configuration: IMPERIUM
 *
 * Theme: "Wars Evolve. So Do We." — The Evolution of Warfare & Strategic Mastery
 * Palette: Warm Ivory/Cream + Deep Navy + Bronze-Gold
 * All user-facing content lives here.
 */

export interface EraStructure {
  title: string;
  subtitle: string;
  description: string;
  rounds: string[];
}

export interface EventInfo {
  name: string;
  codename: string;
  vertical: string;
  description: string;
  dateRange: string;
  prizePool: string;
  prizeFirst: number;
  prizeSecond?: number;
  baseFee: number;
  teamSize: string;
  eligibility: string;
  rules?: string;
  /** The historical commander / military philosopher */
  leader: string;
  /** Tactical doctrine / concept */
  doctrine: string;
  /** One-line hook for hero copy */
  hook: string;
  /** Historical warfare / strategic doctrine arc */
  historicalFact: string;
  /** Strategic code monogram */
  sealLetter: string;
  /** AI & Sci-Fi Warfare lens copy */
  aiLens: string;
  /** Sustainability / Long-term statecraft lens copy */
  sustainabilityLens: string;
  /** Leader image path */
  leaderImage: string;
  /** 3-Era Round Structure */
  era1: EraStructure;
  era2: EraStructure;
  era3: EraStructure;
}

export interface Testimonial {
  quote: string;
  name: string;
  college: string;
  event: string;
}

export interface HotelInfo {
  name: string;
  distance: string;
  priceRange: string;
  rating: number;
  bookingLink: string;
}

export interface CoreTeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const FEST_CONTENT = {
  festName: "USHUS 2026: IMPERIUM",
  theme: "IMPERIUM — The Evolution of Warfare",
  tagline: "Wars Evolve. So Do We.",
  dates: "November 4–5, 2026",
  venue: "Christ University, Bangalore Central Campus",
  googleFormUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "",
  registrationDeadline: "October 25, 2026",

  about: {
    description:
      "USHUS is the flagship annual MBA Management Fest of Christ University's School of Business and Management Studies, Bangalore Central Campus. Born from the Sanskrit word meaning 'dawn', USHUS represents the genesis of transformative leadership and competitive intellect. In 2026, USHUS ascends to its most ambitious theater yet.",
    themeDescription:
      "IMPERIUM frames executive leadership through the crucible of warfare evolution — from the phalanxes of antiquity to modern electronic intelligence and interstellar tactical synchronization. Every business discipline is a theater of war. Ten arenas. Ten legendary commanders. Master the doctrine. Command the battleground.",
    themeInspirations: [
      {
        vertical: "Best Manager",
        metaphor: "THRONIUM — The Corps d'Armée",
        description: "Napoleon Bonaparte's decentralized operational speed and decisive sovereign battlefield intuition.",
      },
      {
        vertical: "Best Management Team",
        metaphor: "VENTURIUM — Supreme Coalition Command",
        description: "Dwight D. Eisenhower's orchestration of D-Day: synchronizing land, sea, air, and geopolitical allies under supreme pressure.",
      },
      {
        vertical: "HR",
        metaphor: "SYNERGIUM — Human Capital Mobilization",
        description: "General George C. Marshall's massive talent architecture and organizational force-multiplication.",
      },
      {
        vertical: "Marketing",
        metaphor: "WARKETIUM — Perception Engineering",
        description: "Edward Bernays' revolutionary science of public opinion and psychological market capture.",
      },
      {
        vertical: "Business Analytics",
        metaphor: "ALGORIUM — Computational Hegemony",
        description: "Alan Turing's Bletchley Park intelligence revolution: breaking uncrackable ciphers through pure mathematical velocity.",
      },
      {
        vertical: "Finance",
        metaphor: "AURIUM — Sovereign Treasury Architecture",
        description: "Alexander Hamilton's creation of financial institutions that fund empires and power revolutions.",
      },
      {
        vertical: "B-Plan",
        metaphor: "BIZARIUM — Adaptive Venture Science",
        description: "Helmuth von Moltke's doctrine that no plan survives first contact with reality without deep systemic resilience.",
      },
      {
        vertical: "B-Quiz",
        metaphor: "COGNITIUM — Intelligence Networks",
        description: "Sir Francis Walsingham's legendary espionage grid: detecting unseen signals in total noise.",
      },
      {
        vertical: "Strategy",
        metaphor: "VICTORIUM — The Art of War",
        description: "Sun Tzu's timeless axiom: winning the war in the boardroom before the first skirmish is ever fought.",
      },
      {
        vertical: "Lean Operations",
        metaphor: "KAIZENIUM — Macedonian Logistical Velocity",
        description: "Alexander the Great's unrivaled supply line speed and synchronized assault doctrines.",
      },
    ],
  },

  stats2026: {
    colleges: 60,
    participants: 600,
    events: 10,
    prizePool: "₹2,41,000",
  },

  verticals: [
    { name: "Best Manager", colorCode: "#C9A84C" },
    { name: "Best Management Team", colorCode: "#D4AF37" },
    { name: "HR", colorCode: "#4A90E2" },
    { name: "Marketing", colorCode: "#E056FD" },
    { name: "Business Analytics", colorCode: "#00E5FF" },
    { name: "Finance", colorCode: "#F1C40F" },
    { name: "B-Plan", colorCode: "#2ECC71" },
    { name: "B-Quiz", colorCode: "#E67E22" },
    { name: "Strategy", colorCode: "#E74C3C" },
    { name: "Lean Operations", colorCode: "#1ABC9C" },
  ],

  events: [
    {
      name: "Thronium (Best Manager)",
      codename: "THRONIUM",
      vertical: "Best Manager",
      leader: "Napoleon Bonaparte",
      doctrine: "Sole Authority & Corps d'Armée Velocity",
      hook: "One supreme commander. Limitless tactical velocity.",
      historicalFact: "Napoleon revolutionized warfare with the Corps d'Armée doctrine — dividing forces to march rapidly and concentrating decisively at the critical focal point before the enemy could react.",
      sealLetter: "TH",
      aiLens: "Executive decision-making amplified by predictive tactical models — act with lightning speed when the board hesitates.",
      sustainabilityLens: "Conquest without resource replenishment causes collapse. Balance aggressive expansion with operational endurance.",
      description: "Enter Thronium. The ultimate individual test of business command, crisis response, and decisive executive instinct modeled on Napoleon's strategic blitzkrieg at Austerlitz.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹25,000",
      prizeFirst: 25000,
      prizeSecond: undefined,
      baseFee: 1500,
      teamSize: "1 member (Individual)",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/napoleon.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Manual Strategy & Tactical Foundation",
        description: "Case diagnostics, crisis triaging under manual constraints, and sovereign decision drills.",
        rounds: ["Round 1: The Austerlitz Dossier", "Round 2: Sovereign Stress Test", "Round 3: Crisis Blitzkrieg", "Round 4: Resource Siege"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "Real-time Telemetry & Hostile Boardroom",
        description: "Live market collapse, sudden stakeholder rebellions, and high-frequency executive bargaining.",
        rounds: ["Round 5: Hostile Takeover Defense", "Round 6: Macroeconomic Shockwave", "Round 7: Supply Corridor Collapse", "Round 8: Media Crossfire"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "On-Stage Algorithmic Battleground",
        description: "Autonomous AI adversary cross-examination, live audience telecast, and grand jury verdict.",
        rounds: ["Round 9: The Synthetic Boardroom", "Round 10: Algorithmic Wargame", "Round 11: Grand Commander Keynote"],
      },
    },
    {
      name: "Venturium (Best Management Team)",
      codename: "VENTURIUM",
      vertical: "Best Management Team",
      leader: "Dwight D. Eisenhower",
      doctrine: "Supreme Command & Coalition Alignment",
      hook: "Multi-branch synchronization under supreme pressure.",
      historicalFact: "General Eisenhower commanded the greatest amphibious invasion in human history on D-Day by forging flawless alignment across rival generals, naval fleets, air forces, and sovereign nations.",
      sealLetter: "VN",
      aiLens: "Autonomous multi-agent orchestration — synchronize your executive leadership squad with real-time computational telemetry.",
      sustainabilityLens: "Alliances built on mutual trust outlast the campaign. Build coalition structures designed for the post-war peace.",
      description: "Claim the Venturium mantle. A high-stakes executive board simulation where 4-member leadership teams must navigate geopolitical crises, cross-functional conflicts, and rapid-response operations.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "4 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/eisenhower.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Coalition Alignment & Mission Planning",
        description: "Multi-functional war-gaming, resource pooling, and preliminary inter-departmental conflict resolution.",
        rounds: ["Round 1: Operation Overlord Blueprint", "Round 2: Cross-Branch War-Game", "Round 3: Allied Coalition Vetting", "Round 4: Logistics Triangulation"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "The Joint Operations Center",
        description: "Simultaneous multi-theater crisis scenarios requiring synchronous executive decisions under time penalties.",
        rounds: ["Round 5: Synchronized Assault", "Round 6: Geopolitical Embargo", "Round 7: Internal Mutiny Arbitration", "Round 8: High-Velocity Redeployment"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Grand Strategy Summit",
        description: "Live on-stage defense against algorithmic market disruptions and executive panel scrutiny.",
        rounds: ["Round 9: The Multi-Agent Wargame", "Round 10: Sovereign Summit Defense", "Round 11: Ultimate Coalition Verdict"],
      },
    },
    {
      name: "Synergium (HR)",
      codename: "SYNERGIUM",
      vertical: "HR",
      leader: "George C. Marshall",
      doctrine: "Talent Architecture & Total Organizational Capacity",
      hook: "Mobilizing millions. Selecting the commanders who win.",
      historicalFact: "As US Army Chief of Staff, Marshall transformed a 180,000-man military into an eight-million-soldier global force, hand-picking legends like Eisenhower and Bradley while architecting the Marshall Plan.",
      sealLetter: "SY",
      aiLens: "AI-driven human capital talent mapping, psychometric profiling, and predictive organizational culture analytics.",
      sustainabilityLens: "Prevent executive burnout and nurture equitable, resilient workforce pipelines that endure across market cycles.",
      description: "Master Synergium. Navigate high-pressure labor negotiations, executive succession warfare, crisis severance arbitration, and organizational restructuring simulations.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/marshall.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Manpower Mobilization & Organizational Design",
        description: "Restructuring failing corporate divisions, rapid talent audits, and strategic workforce allocation.",
        rounds: ["Round 1: The Mobilization Matrix", "Round 2: Leadership Selection Dossier", "Round 3: Succession Blueprint", "Round 4: Culture Diagnostic"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "Industrial Conflict & Labor Arbitration",
        description: "Live negotiation with hostile union representatives, walkout containment, and corporate espionage leaks.",
        rounds: ["Round 5: Wildcat Strike Containment", "Round 6: Executive Hostage Mediation", "Round 7: Whistleblower Triaging", "Round 8: Cross-Border Talent Extraction"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Future of Human Capital",
        description: "On-stage defense of post-crisis restructuring plan with AI workforce simulation stress testing.",
        rounds: ["Round 9: The Synthetic Workforce Debate", "Round 10: Sovereign Marshall Plan", "Round 11: Final Command Arbitration"],
      },
    },
    {
      name: "Warketium (Marketing)",
      codename: "WARKETIUM",
      vertical: "Marketing",
      leader: "Edward Bernays",
      doctrine: "Perception Engineering & Mass Persuasion",
      hook: "The conscious manipulation of the public mind.",
      historicalFact: "Edward Bernays, father of public relations and nephew of Sigmund Freud, proved that consumer desire can be systematically engineered by tying products to subconscious human impulses and mass cultural movements.",
      sealLetter: "WK",
      aiLens: "Hyper-personalized generative ad campaigns, synthetic audience sentiment modeling, and real-time viral vector mapping.",
      sustainabilityLens: "Authentic brand purpose that counters consumer skepticism through radical corporate transparency.",
      description: "Unleash Warketium. Teams engineer provocative brand launches, flip catastrophic PR disasters into viral triumphs, and devise multi-channel market dominance strategies.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/bernays.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Propaganda & Subconscious Narrative Framing",
        description: "Dissecting historical persuasion campaigns and re-engineering legacy brands for modern consumer archetypes.",
        rounds: ["Round 1: Torches of Freedom", "Round 2: Cultural Meme Architecture", "Round 3: Subliminal Pitch", "Round 4: Guerilla Brand Insertion"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "The 24-Hour Viral War Room",
        description: "Real-time deepfake PR crisis handling, hostile cancel-culture management, and algorithmic ad optimization.",
        rounds: ["Round 5: Deepfake Crisis Containment", "Round 6: Algorithmic Hijack", "Round 7: Asymmetric Ad Blitz", "Round 8: Celebrity Endorsement Meltdown"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Mass Persuasion Keynote",
        description: "Live pitch to high-profile CMO jury evaluating generative AI campaign architectures and brand dominance.",
        rounds: ["Round 9: Synthetic Sentiment Gauntlet", "Round 10: Omnichannel Conquest", "Round 11: The Bernays Trophy Pitch"],
      },
    },
    {
      name: "Algorium (Business Analytics)",
      codename: "ALGORIUM",
      vertical: "Business Analytics",
      leader: "Alan Turing",
      doctrine: "Signals Intelligence & Algorithmic Supremacy",
      hook: "Cracking the uncrackable through computational velocity.",
      historicalFact: "Alan Turing conceived the universal computing machine and designed the Bombe at Bletchley Park, breaking the Nazi Enigma code and shortening WWII by years through mathematical intelligence.",
      sealLetter: "AL",
      aiLens: "Train neural nets, decipher chaotic consumer telemetry, and engineer predictive algorithmic forecasting engines under time pressure.",
      sustainabilityLens: "Responsible, transparent AI architectures — algorithms that safeguard data ethics and minimize compute energy footprint.",
      description: "Step into Algorium. Teams decode vast datasets, predict churn vectors, and build AI-driven decision engines that unlock hidden strategic advantage from pure noise.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/turing.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Mathematical Cryptanalysis & Exploratory Analytics",
        description: "Data sanitation, heuristic pattern discovery, and statistical hypothesis testing on unlabelled enterprise data.",
        rounds: ["Round 1: The Enigma Matrix", "Round 2: Statistical Signal Extraction", "Round 3: Anomaly Vector Detection", "Round 4: Algorithmic Heuristics"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "Real-time Telemetry & Predictive Pipelines",
        description: "Streaming telemetry ingestion, predictive model training under compute constraints, and black-swan forecasting.",
        rounds: ["Round 5: High-Frequency Stream Processing", "Round 6: Neural Net Architecture", "Round 7: Adversarial Data Poisoning", "Round 8: Predictive Drift Containment"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Turing Command Defense",
        description: "Live on-stage defense of algorithmic architecture before senior data science and AI venture jury.",
        rounds: ["Round 9: Real-time Benchmark Gauntlet", "Round 10: Model Interpretability Trial", "Round 11: The Bletchley Verdict"],
      },
    },
    {
      name: "Aurium (Finance)",
      codename: "AURIUM",
      vertical: "Finance",
      leader: "Alexander Hamilton",
      doctrine: "Financial Warfare & Sovereign Credit Architecture",
      hook: "Funding the revolution. Engineering the treasury.",
      historicalFact: "Alexander Hamilton established the financial infrastructure of the United States from scratch — funding national debt, founding the first central bank, and proving that sovereign credit is the bedrock of empire.",
      sealLetter: "AU",
      aiLens: "Algorithmic market making, distressed asset arbitrage, and AI-assisted financial stress testing.",
      sustainabilityLens: "Capital structures engineered for generational liquidity and ESG-compliant capital deployment.",
      description: "Command Aurium. Corporate valuation battles, M&A hostile takeover defenses, liquidity crunches, and treasury risk hedging under volatile economic simulations.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/hamilton.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Sovereign Debt, DCF & Asset Valuation",
        description: "Rigorous valuation modeling, forensic financial audits, and capital structure engineering.",
        rounds: ["Round 1: First Bank Charter", "Round 2: Distress Debt Restructuring", "Round 3: Forensic Ledger Audit", "Round 4: LBO Capital Structuring"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "Trading Floor & Hostile M&A Gauntlet",
        description: "Real-time trading pit execution, liquidity freeze management, currency fluctuation hedging, and hostile bids.",
        rounds: ["Round 5: Flash Crash Arbitrage", "Round 6: Sovereign Yield Shock", "Round 7: Poison Pill Takeover Defense", "Round 8: Cross-Currency Hedging"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Treasury Defense",
        description: "On-stage presentation to investment bank managing directors defending portfolio and M&A thesis.",
        rounds: ["Round 9: Algorithmic Stress Test", "Round 10: Investment Committee Hearing", "Round 11: The Hamilton Crown Defense"],
      },
    },
    {
      name: "Bizarium (B-Plan)",
      codename: "BIZARIUM",
      vertical: "B-Plan",
      leader: "Helmuth von Moltke the Elder",
      doctrine: "Logistics Science & Strategic Adaptability",
      hook: "No business plan survives first contact with reality.",
      historicalFact: "Field Marshal von Moltke pioneered modern operational science, teaching that plans must not be rigid scripts, but adaptive frameworks powered by superior rail logistics and distributed tactical initiative.",
      sealLetter: "BZ",
      aiLens: "Stress-test startup models against dynamic AI market simulations to discover fatal flaws before launch.",
      sustainabilityLens: "Build resilient supply chains and circular business models that adapt dynamically when supply lines fracture.",
      description: "Pitch in Bizarium. Venture architects must defend scalable startup business models against unforeseen macroeconomic pivots, logistics shocks, and ruthless venture capitalist cross-examination.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/moltke.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Venture Blueprint & Market Viability",
        description: "Unit economics auditing, TAM/SAM/SOM validation, and structural moat identification.",
        rounds: ["Round 1: The Moltke Blueprint", "Round 2: Unit Economics Siege", "Round 3: Moat Architecture", "Round 4: Cap Table Stress Test"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "First Contact & Market Disruption",
        description: "Sudden regulatory prohibitions, supply chain embargoes, and predatory competitor counter-attacks.",
        rounds: ["Round 5: The Black Swan Pivot", "Round 6: Predatory Pricing War", "Round 7: Supply Chain Severance", "Round 8: Bridge Round Negotiation"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Venture Capitalist Gauntlet",
        description: "Live on-stage investment pitch to institutional VCs and angel investors with simulated term sheet negotiations.",
        rounds: ["Round 9: Synthetic Market Stress Test", "Round 10: Term Sheet Crossfire", "Round 11: The Genesis Syndicate Pitch"],
      },
    },
    {
      name: "Cognitium (B-Quiz)",
      codename: "COGNITIUM",
      vertical: "B-Quiz",
      leader: "Sir Francis Walsingham",
      doctrine: "Intelligence Networks & Cipher Decryption",
      hook: "Separating signal from noise. Truth from deception.",
      historicalFact: "Queen Elizabeth I's spymaster constructed Europe's first state intelligence apparatus, intercepting secret correspondence, cracking Mary Queen of Scots' Babington cipher, and neutralizing threats before they materialized.",
      sealLetter: "CG",
      aiLens: "Navigate real-time deepfakes, synthetic data feeds, and corporate espionage in high-velocity intelligence rounds.",
      sustainabilityLens: "Institutional memory is an organization's immortal asset. Retain and protect knowledge over decades.",
      description: "Conquer Cognitium. A fast-paced intelligence and corporate trivia gauntlet testing deep business acumen, geopolitical economic warfare, brand origins, and cryptographic logic.",
      dateRange: "November 4, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "Open to all B-schools",
      leaderImage: "/leaders/walsingham.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Corporate History & Cryptographic Trivia",
        description: "Written intelligence test covering global business empires, forgotten mergers, and cryptographic puzzles.",
        rounds: ["Round 1: The Babington Decryption", "Round 2: Global Cartel Histories", "Round 3: Brand Genealogy", "Round 4: Anagrammatic Intelligence"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "The Espionage Grid",
        description: "Buzzer rounds, negative scoring traps, audio-visual decipherment, and multi-team alliance bidding.",
        rounds: ["Round 5: Audio Intercept Round", "Round 6: Asymmetric Clue Auction", "Round 7: Corporate Espionage Steal", "Round 8: Sudden-Death Rapid Fire"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Master Spymaster Stage",
        description: "Live on-stage finals with complex multi-stage connectivity questions and speed-accuracy challenges.",
        rounds: ["Round 9: Synthetic Intelligence Maze", "Round 10: The Sovereign Cryptogram", "Round 11: Spymaster's Ultimate Gauntlet"],
      },
    },
    {
      name: "Victorium (Strategy)",
      codename: "VICTORIUM",
      vertical: "Strategy",
      leader: "Sun Tzu",
      doctrine: "Supreme Art of War & Boardroom Psychology",
      hook: "Supreme excellence consists in breaking the enemy without fighting.",
      historicalFact: "Sun Tzu's military treatise The Art of War established that the ultimate strategist shapes the competitive landscape so completely that victory is predetermined before conflict even begins.",
      sealLetter: "VC",
      aiLens: "Game-theoretic strategic simulations, AI opponent modeling, and multi-scenario Monte Carlo warfare analysis.",
      sustainabilityLens: "Long-horizon enterprise strategy that builds unassailable competitive moats while safeguarding organizational longevity.",
      description: "Compete in Victorium. The flagship corporate strategy theater testing game theory, predatory market entry, asymmetrical competitive positioning, and board psychological warfare.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/suntzu.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Doctrine Analysis & Asymmetrical Tactics",
        description: "Sun Tzu's Five Factors applied to industry disruption, Nash equilibrium calculations, and market mapping.",
        rounds: ["Round 1: The Five Strategic Factors", "Round 2: Asymmetrical Market Entry", "Round 3: Deception & Misdirection Dossier", "Round 4: Game Theory Payoff Matrix"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "The Wargame Arena",
        description: "Live turn-based business wargame with hidden moves, blind bidding, and predatory regulatory capture.",
        rounds: ["Round 5: Simultaneous Blind Bidding", "Round 6: Hostile Territory Annexation", "Round 7: Fifth-Column Board Subversion", "Round 8: The Sun Tzu Ceasefire Arbitrage"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Supreme Command Trial",
        description: "Live on-stage strategic defense against an adaptive AI opposing force and distinguished panel of strategy consultants.",
        rounds: ["Round 9: AI Adversary Game", "Round 10: The Sovereign Hegemony Plan", "Round 11: Grand Sun Tzu Stratagem"],
      },
    },
    {
      name: "Kaizenium (Lean Operations)",
      codename: "KAIZENIUM",
      vertical: "Lean Operations",
      leader: "Alexander the Great",
      doctrine: "The Macedonian Phalanx & Supply Chain Velocity",
      hook: "Marching across continents without breaking the supply line.",
      historicalFact: "Alexander conquered the known world from Greece to India not just through tactical genius, but by eliminating baggage trains, living off synchronized supply corridors, and moving armies with unrivaled logistical speed.",
      sealLetter: "KZ",
      aiLens: "Predictive inventory routing, digital twin factory optimization, and autonomous drone fleet delivery pipelines.",
      sustainabilityLens: "Zero-waste circular manufacturing, lean Six Sigma elimination of environmental inefficiencies.",
      description: "Execute in Kaizenium. Solve bottleneck crises in global supply chains, design agile lean production facilities, and optimize distribution networks under severe disruption.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹24,000",
      prizeFirst: 15000,
      prizeSecond: 9000,
      baseFee: 1500,
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
      leaderImage: "/leaders/alexander.jpg",
      era1: {
        title: "Era I — Historical Prelims",
        subtitle: "Logistical Blueprint & Lean Diagnostics",
        description: "Value stream mapping, Theory of Constraints bottleneck resolution, and warehouse layout optimization.",
        rounds: ["Round 1: The Macedonian Corridor", "Round 2: Critical Path Analysis", "Round 3: Lean Six Sigma Kaizen", "Round 4: Inventory Bullwhip Containment"],
      },
      era2: {
        title: "Era II — Live Simulation",
        subtitle: "Global Supply Chain Severance",
        description: "Real-time Suez Canal style blockages, port worker strikes, catastrophic supplier insolvencies, and dynamic rerouting.",
        rounds: ["Round 5: Port Congestion Crisis", "Round 6: Dynamic Fleet Rerouting", "Round 7: Tier-3 Supplier Insolvency", "Round 8: Reverse Logistics Emergency"],
      },
      era3: {
        title: "Era III — AI Finals",
        subtitle: "The Autonomous Logistics Command",
        description: "On-stage defense of automated supply network architecture before industry COO jury.",
        rounds: ["Round 9: Digital Twin Stress Test", "Round 10: Sustainable Network Optimization", "Round 11: The Alexander Logistics Trophy"],
      },
    },
  ] satisfies EventInfo[],

  testimonials: [
    {
      quote:
        "USHUS pushed me to think beyond textbooks and execute real-world strategy under extreme tactical pressure. The atmosphere in Thronium was electrifying!",
      name: "Rahul Menon",
      college: "IIM Kozhikode",
      event: "Thronium (Best Manager)",
    },
    {
      quote:
        "Competing against the sharpest MBA minds in the country in the Aurium Finance arena was an unmatched trial by fire. Pure executive rigor.",
      name: "Priya Sharma",
      college: "XLRI Jamshedpur",
      event: "Aurium (Finance)",
    },
    {
      quote:
        "The live supply chain bottleneck simulations in Kaizenium tested our team's operational velocity to the absolute maximum. Unforgettable experience!",
      name: "Ananya Iyer",
      college: "FMS Delhi",
      event: "Kaizenium (Lean Operations)",
    },
  ] satisfies Testimonial[],

  hotels: [
    {
      name: "The Grand Mercure Bangalore",
      distance: "2.4 km from campus",
      priceRange: "₹4,500 – ₹7,000 / night",
      rating: 4.6,
      bookingLink: "https://all.accor.com",
    },
    {
      name: "Ibis Bengaluru Hosur Road",
      distance: "1.8 km from campus",
      priceRange: "₹2,800 – ₹4,200 / night",
      rating: 4.2,
      bookingLink: "https://all.accor.com",
    },
    {
      name: "Treebo Trend Central Campus",
      distance: "0.6 km from campus",
      priceRange: "₹1,400 – ₹2,200 / night",
      rating: 4.0,
      bookingLink: "https://www.treebo.com",
    },
    {
      name: "FabHotel St. John's Road",
      distance: "1.1 km from campus",
      priceRange: "₹1,200 – ₹1,800 / night",
      rating: 3.9,
      bookingLink: "https://www.fabhotels.com",
    },
  ] satisfies HotelInfo[],

  emergencyContacts: [
    {
      name: "Dr. Joseph Varghese",
      role: "Faculty Coordinator",
      email: "joseph.varghese@christuniversity.in",
      phone: "+91 98450 12345",
    },
    {
      name: "Rohan Kulkarni",
      role: "Student General Secretary",
      email: "rohan.kulkarni@mba.christuniversity.in",
      phone: "+91 97312 34567",
    },
    {
      name: "Sneha Nair",
      role: "Logistics & Hospitality Head",
      email: "sneha.nair@mba.christuniversity.in",
      phone: "+91 98865 67890",
    },
    {
      name: "Aditya Hegde",
      role: "Security & First-Aid Coordinator",
      email: "aditya.hegde@mba.christuniversity.in",
      phone: "+91 99001 23456",
    },
  ] satisfies CoreTeamMember[],

  faqs: [
    {
      question: "Who is eligible to participate in USHUS 2026: IMPERIUM?",
      answer:
        "All bona fide postgraduate management students (MBA, PGDM, MMS) currently enrolled in recognized business schools across India are eligible to compete. Valid college ID is mandatory upon registration and check-in.",
    },
    {
      question: "Can a participant register for multiple events?",
      answer:
        "No. Event schedules run concurrently across both operational days. Each participant may only deploy into one event theater, except in the contingent category where each event must have separate participants.",
    },
    {
      question: "What is the Early Bird pricing and contingent discount?",
      answer:
        "Early Bird registration is open until September 30, 2026, 23:59 IST. Individual events receive a 40% discount (₹900 instead of ₹1,500). Institutions deploying a full contingent across all 10 events receive a 50% discount (₹7,500 total).",
    },
    {
      question: "Is accommodation guaranteed on campus?",
      answer:
        "Accommodation inside the Christ University Bengaluru Central Campus is provided on a strict first-come-first-served basis subject to room availability. While you can request accommodation during registration, it is not guaranteed. We also provide recommended verified nearby hotels.",
    },
    {
      question: "What is the 3-Era round structure?",
      answer:
        "Every event in IMPERIUM follows a 3-Era doctrine: Era I (Historical/Manual Prelims on Day 1), Era II (Real-time live crisis simulation on Day 1-2), and Era III (AI-augmented stage finals and boardroom defenses on Day 2).",
    },
  ] satisfies FAQ[],
};
