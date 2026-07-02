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
  festName: "USHUS 2026",
  theme: "Constellation",
  tagline: "Illuminate your potential",
  dates: "November 6-7, 2026",
  venue: "Christ University, Bangalore Central Campus",
  googleFormUrl: process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "",
  registrationDeadline: "October 27, 2026",

  about: {
    description:
      "USHUS is the flagship annual MBA Management Fest of Christ University's School of Business and Management Studies, Bangalore Central Campus. Born from the Sanskrit word meaning 'dawn', USHUS represents the beginning of new ideas, fresh perspectives, and transformative leadership. For over a decade, USHUS has been the premier inter-collegiate platform where the brightest management minds converge to compete, collaborate, and create impact across core management disciplines.",
    themeDescription:
      "The 2026 theme — Constellation — celebrates the power of individual brilliance coming together to form something greater. Just as stars form patterns that have guided explorers for millennia, USHUS 2026 invites participants to discover their unique light while connecting with others to illuminate the path forward in the world of business and management.",
    themeInspirations: [
      {
        vertical: "Marketing",
        metaphor: "The Storytellers",
        description: "Like the constellations that ancient cultures wove stories around, marketing is about crafting narratives that guide and inspire.",
      },
      {
        vertical: "Finance",
        metaphor: "The Navigators",
        description: "Just as sailors used stars to chart courses across oceans, finance professionals navigate the complex waters of global markets.",
      },
      {
        vertical: "HR",
        metaphor: "The Connectors",
        description: "Constellations are individual stars connected by invisible lines — HR creates the bonds that turn a group of individuals into a team.",
      },
      {
        vertical: "Operations",
        metaphor: "The Architects",
        description: "Behind every constellation is a precise astronomical framework — operations builds the systems that make great things possible.",
      },
      {
        vertical: "Entrepreneurship",
        metaphor: "The Trailblazers",
        description: "Every constellation was once unnamed stars. Entrepreneurs are the ones who see patterns others miss and name new constellations.",
      },
    ],
  },

  stats2026: {
    colleges: 50,
    participants: 500,
    events: 9,
    prizePool: "₹3,00,000",
  },

  stats2025: {
    colleges: 40,
    participants: 1200,
    events: 8,
    prizePool: "₹2,50,000",
  },

  verticals: [
    { name: "Best Manager", colorCode: "#E63946" },
    { name: "Best Management Team", colorCode: "#2A9D8F" },
    { name: "B Quiz", colorCode: "#E9C46A" },
    { name: "Finance", colorCode: "#264653" },
    { name: "Marketing", colorCode: "#F4A261" },
    { name: "Operations", colorCode: "#8338EC" },
    { name: "HR", colorCode: "#3A86FF" },
    { name: "Business Analytics", colorCode: "#FF006E" },
    { name: "Sustainability", colorCode: "#38B000" },
  ],

  events: [
    {
      name: "Best Manager",
      vertical: "Best Manager",
      description: "The ultimate test of leadership, strategy, and business acumen. One individual will rise above the rest as the Best Manager.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹50,000",
      teamSize: "1 member",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Best Management Team",
      vertical: "Best Management Team",
      description: "A collaborative challenge testing team dynamics, synergy, and execution across all business disciplines.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹40,000",
      teamSize: "4 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "B Quiz",
      vertical: "B Quiz",
      description: "A battle of wits and intelligence covering business history, current affairs, and global industry trends.",
      dateRange: "November 6, 2026",
      prizePool: "₹20,000",
      teamSize: "2 members",
      eligibility: "Open to all B-schools",
    },
    {
      name: "Finance",
      vertical: "Finance",
      description: "Test financial engineering, asset valuations, and portfolio defense under extreme volatility.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,000",
      teamSize: "2-3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Marketing",
      vertical: "Marketing",
      description: "Design and present disruptive brand campaigns, product launches, and growth hacking strategies.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,000",
      teamSize: "3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Operations",
      vertical: "Operations",
      description: "Solve complex logistics bottlenecks, warehouse configurations, and lean process designs.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,000",
      teamSize: "2-3 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "HR",
      vertical: "HR",
      description: "Simulated boardroom scenarios focusing on negotiations, talent optimization, and organizational behavioral policy.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,005",
      teamSize: "2 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Business Analytics",
      vertical: "Business Analytics",
      description: "Sift through big data to extract commercial insights, predict trends, and deliver predictive modeling.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,000",
      teamSize: "2 members",
      eligibility: "MBA / PGDM students",
    },
    {
      name: "Sustainability",
      vertical: "Sustainability",
      description: "Develop corporate action plans resolving carbon footprinting, greenwashing, and circular economy compliance.",
      dateRange: "November 6-7, 2026",
      prizePool: "₹30,000",
      teamSize: "2-3 members",
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
