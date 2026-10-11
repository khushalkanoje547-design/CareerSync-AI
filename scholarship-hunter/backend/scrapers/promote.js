// backend/scrapers/promote.js
// Step 5: reads un-promoted records from RawOpportunity, skips anything
// that already exists in the live Opportunity collection (matched by link),
// inserts the rest, and marks the staging rows as promoted.
//
// Run with: node scrapers/promote.js
 
require('dotenv').config();
const mongoose = require('mongoose');
const RawOpportunity = require('../models/RawOpportunity');
const Opportunity = require('../models/Opportunity');
 
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');
 
  const pending = await RawOpportunity.find({ promoted: false });
  console.log(`${pending.length} staged record(s) waiting to be promoted.`);
 
  let promoted = 0;
  let duplicates = 0;
 
  for (const raw of pending) {
    const existing = await Opportunity.findOne({ link: raw.link });
 
    if (existing) {
      // Already live — just mark this staging row done, don't insert again.
      duplicates++;
    } else {
      await Opportunity.create({
        title: raw.title,
        type: raw.type,
        eligibleBranches: raw.eligibleBranches,
        eligibleYears: raw.eligibleYears,
        eligibleCategories: raw.eligibleCategories,
        location: raw.location,
        deadline: raw.deadline,
        link: raw.link,
        description: raw.description
      });
      promoted++;
    }
 
    raw.promoted = true;
    await raw.save();
  }
 
  console.log(`${promoted} new opportunity/opportunities added to the live collection.`);
  console.log(`${duplicates} were already live (skipped, staging row cleared).`);
 
  await mongoose.disconnect();
}
 
run().catch(err => {
  console.error('Promote script failed:', err.message);
  process.exit(1);
});
 