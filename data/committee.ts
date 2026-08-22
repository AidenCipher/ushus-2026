/**
 * USHUS 2026 — Committee & Leadership Data
 *
 * Single source of truth for all credits displayed on the site.
 * Edit names here; no JSX changes required.
 *
 * Naming rules (enforced here):
 *  - Titles (Dr, Ms, Mr, Rev, Fr) do NOT carry a trailing '.'
 *  - Initials DO carry a trailing '.'   e.g.  "T.V." or "B."
 *
 * Source: Client-provided data (verified 2026-08-22).
 */

export interface CommitteeMember {
  name: string;
}

export interface CommitteeCategory {
  /** Short label shown in gold caps above the name list */
  title: string;
  /** Role / subtitle shown below the title, optional */
  subtitle?: string;
  members: CommitteeMember[];
}

export const COMMITTEE: CommitteeCategory[] = [
  // ── Leadership ─────────────────────────────────────────────────────
  {
    title: "University & School Leadership",
    members: [
      { name: "Rev Fr Thomas T.V." },    // Director, SBM
      { name: "Dr Sathiya Seelan B." },    // Associate Dean
      { name: "Dr Mareena Mathew" },       // HOD
      { name: "Dr Jacob Joseph K." },         // Campus Coordinator
    ],
  },
  // ── Faculty Coordinators ────────────────────────────────────────────
  {
    title: "Faculty Coordinators",
    members: [
      { name: "Dr Anil B. Gowda" },
      { name: "Dr Sreedhara Raman" },
      { name: "Dr Elizabeth Chacko" },
      { name: "Dr Vijay Kumar N." },
      { name: "Ms Shrutha Nadig" },
    ],
  },
  // ── Student Coordinators ─────────────────────────────────────────────
  {
    title: "Student Coordinators",
    members: [
      { name: "Abhinav Rotti" },
      { name: "Aishwarya G." },
    ],
  },
  // ── Core Committee (alphabetical) ──────────────────────────────────
  {
    title: "Core Committee",
    members: [
      { name: "Abhinav Rotti" },
      { name: "Aishwarya G." },
      { name: "Deepthi Mariam John" },
      { name: "F. Elaine Esther" },
      { name: "Keerthi Elizabath John M." },
      { name: "Krishna Bhadhran" },
      { name: "Nikilesh A.M." },
      { name: "Shiva Shankar" },
      { name: "Tharun Karthic K." },
      { name: "Vighnesh V.R." },
    ],
  },
  // ── Managing Committee (alphabetical) ──────────────────────────────
  {
    title: "Managing Committee",
    members: [
      { name: "Aaron Zachariah George" },
      { name: "Adithya Ranganath S." },
      { name: "Albert Shajan" },
      { name: "Anagha Nair" },
      { name: "Anamika N. Anil" },
      { name: "Ananaya P. Reddy" },
      { name: "Ashley James" },
      { name: "Aswin Koshy Varughese" },
      { name: "B. N. V. S. V. Vishal" },
      { name: "Celin Kezia S." },
      { name: "Devananda T." },
      { name: "Esha Jaiswal" },
      { name: "Hiteishi A." },
      { name: "Hrishikesh V. Kattishetti" },
      { name: "Isha Sreenivasan" },
      { name: "M. Rashmi Pai" },
      { name: "Manasa B." },
      { name: "Manisha G." },
      { name: "Manoj Ramesh" },
      { name: "Mithul Thomas" },
      { name: "Mitul Sanjay" },
      { name: "Sahaja Sai Jampana" },
      { name: "Sagar M." },
      { name: "Surendar C.A." },
      { name: "Tarush Bhusri" },
      { name: "Theertha B. Nambair" },
      { name: "V. Mithun Visal" },
    ],
  },
  // ── MDC ────────────────────────────────────────────────────────────
  {
    title: "MDC",
    subtitle: "Media, Design & Creative",
    members: [],
  },
];

/**
 * Leadership roles with named titles, for the Credits section.
 */
export interface LeadershipMember {
  role: string;
  name: string;
}

export const LEADERSHIP: LeadershipMember[] = [
  { role: "Director", name: "Rev Fr Thomas T.V." },
  { role: "Associate Dean", name: "Dr Sathiya Seelan B." },
  { role: "HOD", name: "Dr Mareena Mathew" },
  { role: "Campus Coordinator", name: "Dr Jacob Joseph K." },
];
