// backend/seed.js
// One-time script to bulk-insert real opportunities into MongoDB.
// Run with: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Opportunity = require('./models/Opportunity');

const opportunities = [
  {
    title: "AICTE Pragati Scholarship for Girls",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "For girl students in 1st/2nd year of AICTE-approved degree/diploma courses. Family income under Rs 8 lakh. Rs 50,000/year via DBT. Apply on NSP."
  },
  {
    title: "AICTE Saksham Scholarship for Specially-Abled Students",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "For specially-abled students (40%+ disability) in AICTE-approved technical courses. Rs 50,000/year via DBT. Apply on NSP."
  },
  {
    title: "AICTE Swanath Scholarship (Orphan Students)",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "For orphan students pursuing technical education in AICTE-approved institutions. Apply on NSP."
  },
  {
    title: "AICTE GATE Scholarship (PG Students)",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [4],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-12-15"),
    link: "https://www.aicte-gate.in",
    description: "For M.Tech/PG students admitted with a valid GATE score. Rs 12,400/month stipend. Portal opens Sept 2026 — verify exact closing date before applying."
  },
  {
    title: "Central Sector Scheme of Scholarship (CSSS)",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["General", "EWS"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "Merit-based scholarship for college students with family income below the prescribed limit. Apply on NSP."
  },
  {
    title: "NSP Post-Matric Scholarship for SC Students",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["SC"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "Post-matric scholarship for SC students in recognized colleges/universities. Apply on NSP."
  },
  {
    title: "NSP Post-Matric Scholarship for OBC Students",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["OBC"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "Post-matric scholarship for OBC students in recognized colleges/universities. Apply on NSP."
  },
  {
    title: "NSP Post-Matric Scholarship for ST Students",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["ST"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "Post-matric scholarship for ST students in recognized colleges/universities. Apply on NSP."
  },
  {
    title: "National Scholarship Portal - One Time Registration (OTR) Reminder",
    type: "govt_scheme",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "OTR is mandatory before applying to ANY NSP scheme. Requires Aadhaar-linked mobile number. Complete this first if applying to any scholarship above."
  },
  {
    title: "Smart India Hackathon (SIH) 2026",
    type: "hackathon",
    eligibleBranches: ["any"],
    eligibleYears: [2, 3, 4],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-09-30"),
    link: "https://sih.gov.in",
    description: "India's largest national hackathon (AICTE + Ministry of Education). Teams of 6 (min. 1 female member), nominated via college SPOC after winning internal round. National finale in December 2026. Check with your college SPOC for the exact internal round deadline."
  },
  {
    title: "IIT Bhubaneswar Winter Internship 2026",
    type: "internship",
    eligibleBranches: ["any"],
    eligibleYears: [2, 3, 4],
    eligibleCategories: ["any"],
    location: "any",
    deadline: new Date("2026-11-06"),
    link: "https://webapps.iitbbs.ac.in/internship-application",
    description: "3-4 week research internship during IIT Bhubaneswar's winter vacation (December). Based on last year's pattern (portal typically opens early October) — verify the exact 2026 dates on the official portal closer to October."
  },
  {
    title: "NSP Merit-cum-Means Scholarship (Technical/Professional Courses)",
    type: "scholarship",
    eligibleBranches: ["any"],
    eligibleYears: [1, 2, 3, 4],
    eligibleCategories: ["General", "OBC", "EWS"],
    location: "any",
    deadline: new Date("2026-10-31"),
    link: "https://scholarships.gov.in",
    description: "For minority-community students in professional/technical degree courses, based on merit and family income. Apply on NSP."
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected — starting seed...');

    // Optional: clear existing opportunities before inserting fresh ones.
    // Comment this line out if you want to keep old data and just add more.
    await Opportunity.deleteMany({});
    console.log('Old opportunities cleared.');

    const result = await Opportunity.insertMany(opportunities);
    console.log(`${result.length} opportunities inserted successfully.`);

    process.exit(0);
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });