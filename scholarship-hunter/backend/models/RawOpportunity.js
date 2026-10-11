const mongoose = require('mongoose');
 
// Staging area for scraped data. Scrapers write here; a separate cleanup
// step (Step 5) reads from here, de-duplicates, and promotes clean records
// into the real Opportunity collection. Keeping these separate means a bad
// scrape never touches live data directly.
const rawOpportunitySchema = new mongoose.Schema({
  source: { type: String, required: true }, // e.g. "devfolio"
  title: { type: String, required: true },
  type: { type: String, required: true },
  eligibleBranches: [{ type: String }],
  eligibleYears: [{ type: Number }],
  eligibleCategories: [{ type: String }],
  location: { type: String, default: 'any' },
  deadline: { type: Date, required: true },
  link: { type: String, required: true },
  description: { type: String },
  scrapedAt: { type: Date, default: Date.now },
  promoted: { type: Boolean, default: false } // true once Step 5 has copied it into Opportunity
});
 
module.exports = mongoose.model('RawOpportunity', rawOpportunitySchema);
 