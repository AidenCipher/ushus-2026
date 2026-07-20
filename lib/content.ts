/**
 * USHUS 2026 — Fest Content Configuration
 *
 * All user-facing content lives here. Update these values without code changes.
 * Anything marked TBD will display as "TBD" on the website.
 */

export interface EventInfo {
  name: string;
  vertical: string;
  description: string;
  dateRange: string;
  prizePool: string;
  teamSize: string;
  eligibility: string;
  rules?: string;
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
  festName: "USHUS 2026: VIRENZA",
  theme: "VIRENZA — Dynasties of India",
  tagline: "Ancient wisdom. Modern leaders.",
  dates: "November 4–5, 2026",
  venue: "Christ University, Bangalore Central Campus",
  googleFormUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "",
  registrationDeadline: "October 25, 2026",

  about: {
    description:
      "USHUS is the flagship annual MBA Management Fest of Christ University's School of Business and Management Studies, Bangalore Central Campus. Born from the Sanskrit word meaning 'dawn', USHUS represents the beginning of new ideas, fresh perspectives, and transformative leadership. For over a decade, USHUS has been the premier inter-collegiate platform where the brightest management minds converge to compete, collaborate, and create impact across core management disciplines.",
    themeDescription:
      "VIRENZA fuses VIR — the Sanskrit root for courage and valour — with a modern energetic edge. India's history was never written by a single empire; it was built by a succession of dynasties, each mastering a different discipline: warfare, trade, governance, scholarship, engineering. VIRENZA reframes every USHUS 2026 competition as a domain a great dynasty once ruled, and asks each participant: which discipline will you master? Ten events. Ten dynasties. One legacy.",
    themeInspirations: [
      {
        vertical: "Best Manager",
        metaphor: "MAURYA — One Empire, One Vision",
        description: "Chandragupta Maurya built India's first pan-subcontinental empire — proof individual leadership under pressure can reshape a map.",
      },
      {
        vertical: "Finance",
        metaphor: "SATAVAHANA — The First Rupee",
        description: "Among the earliest dynasties to mint regulated currency and formalise trade taxation — the literal architecture of a financial system.",
      },
      {
        vertical: "HR",
        metaphor: "GUPTA — Talent as Treasury",
        description: "The Gupta court funded Aryabhata, Kalidasa, and a generation of scholars — proof an empire's real asset is its people.",
      },
      {
        vertical: "Logistics, Operations & Systems",
        metaphor: "KAKATIYA — Engineering as Backbone",
        description: "The Kakatiya tank-cascade irrigation network moved water across a kingdom with near-modern precision — infrastructure as an empire's invisible backbone.",
      },
      {
        vertical: "Strategy",
        metaphor: "CHALUKYA — Strategy Over Scale",
        description: "Pulakeshin II halted the mighty Harshavardhana — not through greater numbers, but through superior strategic positioning. The definitive ancient-Indian case study in strategy triumphing over scale.",
      },
    ],
  },

  stats2026: {
    colleges: 60,
    participants: 600,
    events: 10,
    prizePool: "₹3,00,000",
  },

  stats2025: {
    colleges: 40,
    participants: 1200,
    events: 8,
    prizePool: "₹2,50,000",
  },

  verticals: [
    { name: "Best Manager", colorCode: "#C8102E" },
    { name: "Best Management Team", colorCode: "#A67C00" },
    { name: "B-Quiz", colorCode: "#8B0000" },
    { name: "Finance", colorCode: "#B8860B" },
    { name: "Marketing", colorCode: "#9B2335" },
    { name: "Logistics, Operations & Systems (LOS)", colorCode: "#7B5E00" },
    { name: "HR", colorCode: "#6B0F1A" },
    { name: "Business Analytics (BA)", colorCode: "#8B6914" },
    { name: "Business Plan", colorCode: "#A0522D" },
    { name: "Strategy", colorCode: "#722F37" },
  ],

  events: [
    {
      name: "Best Manager",
      vertical: "Best Manager",
      description: "Claim the MAURYA title. One empire. One vision. One decisive mind. The ultimate test of individual leadership, strategy, and business acumen — modelled on Chandragupta Maurya's pan-subcontinental statecraft.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹50,000",
      teamSize: "1 member",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Best Management Team",
      vertical: "Best Management Team",
      description: "Claim the ASHTAPRADHAN title. Eight ministers. One kingdom. Zero silos. A cross-functional executive team challenge modelled on Shivaji's council of eight — the earliest recorded model of specialised teamwork.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹40,000",
      teamSize: "4 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "HR",
      vertical: "HR",
      description: "Claim the GUPTA title. The age that made talent its treasury. Simulated boardroom scenarios testing negotiation, talent optimisation, and organisational policy — because the Gupta court knew: an empire's real asset is its people.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Finance",
      vertical: "Finance",
      description: "Claim the SATAVAHANA title. The first rupee had their name on it. Financial engineering, asset valuations, and portfolio defence — built on the Satavahana legacy of regulated currency and trade taxation across the Deccan.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2–3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Marketing",
      vertical: "Marketing",
      description: "Claim the MUGHAL title. An empire that never stopped building its own myth. Brand campaigns, product launches, and growth strategy — rooted in the Mughal understanding that power is also perception: spectacle and scale as deliberate brand strategy.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Business Plan",
      vertical: "Business Plan",
      description: "Claim the VIJAYANAGARA title. A marketplace so rich, the world came to it. Build a scalable business from a single founding idea — modelled on Hampi's bazaars that drew merchants from Persia to Portugal.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2–3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "B-Quiz",
      vertical: "B-Quiz",
      description: "Claim the PALLAVA title. They built a capital out of ideas. A battle of business knowledge, current affairs, and industry intelligence — inspired by the Pallavas who made Kanchipuram a great centre of learning.",
      dateRange: "November 4, 2026",
      prizePool: "₹20,000",
      teamSize: "2 members",
      eligibility: "Open to all B-schools",
    },
    {
      name: "Business Analytics (BA)",
      vertical: "Business Analytics (BA)",
      description: "Claim the CHOLA title. They governed by the numbers — nine centuries early. Extract commercial insights from data, predict trends, and build predictive models — in the tradition of the Chola Uttaramerur inscriptions: governance built on data.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Logistics, Operations & Systems (LOS)",
      vertical: "Logistics, Operations & Systems (LOS)",
      description: "Claim the KAKATIYA title. An empire run on engineering, not luck. Solve complex logistics, lean process design, and systems optimisation — modelled on the Kakatiya tank-cascade irrigation network, infrastructure as an empire's invisible backbone.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2–3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Strategy",
      vertical: "Strategy",
      description: "Claim the CHALUKYA title. The empire that out-thought a larger one. Pulakeshin II halted Harshavardhana's southward expansion — not through greater numbers, but through superior strategic positioning. The definitive ancient-Indian case study in strategy triumphing over scale.",
      dateRange: "November 4–5, 2026",
      prizePool: "₹30,000",
      teamSize: "2–3 members",
      eligibility: "MBA / PGDM students",
    },
  ] satisfies EventInfo[],

  testimonials: [
    {
      quote:
        "USHUS was a game-changer for my MBA journey. The Best Manager event pushed me to think beyond textbooks and apply real-world strategy under pressure. The energy was electric!",
      name: "Rahul Menon",
      college: "IIM Kozhikode",
      event: "Best Manager",
    },
    {
      quote:
        "The level of competition at USHUS is unmatched. Competing against the best MBA minds in the country in the Finance event was an incredible learning experience.",
      name: "Priya Sharma",
      college: "XLRI Jamshedpur",
      event: "Finance",
    },
    {
      quote:
        "What sets USHUS apart is the quality of organisation. Everything from registration to the event execution was seamless. Christ University really knows how to host a management fest.",
      name: "Aditya Kulkarni",
      college: "Symbiosis Institute of Business Management",
      event: "Best Management Team",
    },
    {
      quote:
        "The HR event was the closest thing to a real boardroom scenario I have experienced in my MBA. The judges' feedback was invaluable and helped me secure my summer internship.",
      name: "Sneha Reddy",
      college: "NMIMS Mumbai",
      event: "HR",
    },
    {
      quote:
        "USHUS was my first inter-collegiate fest and it exceeded all expectations. The networking opportunities alone made the trip from Delhi worth it.",
      name: "Karan Joshi",
      college: "MDI Gurgaon",
      event: "Operations",
    },
    {
      quote:
        "The B Quiz panel included actual corporate quizzers who gave us real feedback. We ended up refining our business knowledge database significantly.",
      name: "Ananya Iyer",
      college: "ISB Hyderabad",
      event: "B Quiz",
    },
    {
      quote:
        "Bangalore + Christ University + USHUS = the perfect trifecta. The campus is beautiful, the events are world-class, and the hospitality is top-notch. Cannot wait for 2026!",
      name: "Mohammed Faisal",
      college: "Great Lakes Institute of Management",
      event: "Sustainability",
    },
    {
      quote:
        "As a participant from a smaller B-school, I was nervous about competing against tier-1 students. But USHUS creates a level playing field where ideas win, not brand names.",
      name: "Deepika Nair",
      college: "Christ University (Alumna)",
      event: "Marketing",
    },
  ] satisfies Testimonial[],

  coreTeam: [
    {
      name: "Abhinav",
      role: "Core Organiser & Admin",
      email: "abhinav@ushus2026.com",
      phone: "TBD",
    },
    {
      name: "Aishwarya G.",
      role: "Core Organiser & Admin",
      email: "aishwarya@ushus2026.com",
      phone: "TBD",
    },
    {
      name: "Faculty Coordinator",
      role: "Faculty Coordinator",
      email: "faculty@christuniversity.in",
      phone: "TBD",
    },
  ] satisfies CoreTeamMember[],

  hotels: [
    {
      name: "The Leela Palace Bangalore",
      distance: "3.5 km",
      priceRange: "₹12,000 - ₹25,000/night",
      rating: 4.8,
      bookingLink: "https://www.theleela.com/the-leela-palace-bengaluru/",
    },
    {
      name: "Lemon Tree Hotel, Electronics City",
      distance: "4 km",
      priceRange: "₹3,500 - ₹6,000/night",
      rating: 4.2,
      bookingLink: "https://www.lemontreehotels.com/",
    },
    {
      name: "FabHotel Cabana GR Stay",
      distance: "2 km",
      priceRange: "₹1,500 - ₹3,000/night",
      rating: 3.8,
      bookingLink: "https://www.fabhotels.com/",
    },
    {
      name: "OYO Townhouse Near Christ University",
      distance: "1 km",
      priceRange: "₹1,200 - ₹2,500/night",
      rating: 3.6,
      bookingLink: "https://www.oyorooms.com/",
    },
    {
      name: "Treebo Trend Hotel Bliss",
      distance: "2.5 km",
      priceRange: "₹2,000 - ₹4,000/night",
      rating: 4.0,
      bookingLink: "https://www.treebo.com/",
    },
  ] satisfies HotelInfo[],

  faqs: [
    {
      question: "Who can participate in USHUS 2026?",
      answer:
        "USHUS 2026 is open to MBA and PGDM students from any AICTE/UGC recognised institution across India. Both first-year and second-year students are eligible to participate.",
    },
    {
      question: "What is the registration fee?",
      answer:
        "TBD. The fee covers participation in all registered events, fest kit, meals during the fest days, and access to all networking sessions.",
    },
    {
      question: "Can I register for multiple events?",
      answer:
        "Yes, you can register for up to 3 events across different verticals. However, ensure that the event schedules do not overlap. Team registrations are handled separately for each event.",
    },
    {
      question: "What documents do I need for registration?",
      answer:
        "You will need a valid college ID card, a letter of recommendation from your college (optional but preferred), and a passport-size photograph. All documents can be uploaded during the Google Form registration.",
    },
    {
      question: "How will I know if my registration is confirmed?",
      answer:
        "After submitting the Google Form, our team will review your registration within 48 hours. You will receive a confirmation email with your unique USHUS-2026 confirmation code and login credentials to the participant dashboard.",
    },
    {
      question: "Is accommodation provided?",
      answer:
        "USHUS 2026 does not provide official accommodation. However, we have curated a list of recommended hotels and PGs near the campus at various price points. Check the Accommodation section in your participant dashboard after registration.",
    },
    {
      question: "What is the cancellation policy?",
      answer:
        "Full refund if cancelled 15 days before the fest. 50% refund if cancelled 7-14 days before. No refund within 7 days of the fest. Substitution of team members is allowed up to 3 days before.",
    },
    {
      question: "Can I participate as an individual?",
      answer:
        "Most events require teams. However, some events allow smaller team sizes (2 members) or individual registration (e.g. Best Manager). Check the specific event requirements for details.",
    },
  ] satisfies FAQ[],

  contact: {
    email: "ushus@christuniversity.in",
    phone: "TBD",
    instagram: "https://instagram.com/ushus_christuniversity",
    linkedin: "https://linkedin.com/company/ushus-christuniversity",
    twitter: "https://twitter.com/ushus_christ",
  },

  emergencyContacts: [
    {
      name: "Christ University Security",
      phone: "TBD",
      available: "24/7",
    },
    {
      name: "Nearest Hospital — Fortis Hospital",
      phone: "080-6678-9999",
      available: "24/7",
    },
    {
      name: "Ambulance",
      phone: "108",
      available: "24/7",
    },
  ],
} as const;

export type FestContent = typeof FEST_CONTENT;
